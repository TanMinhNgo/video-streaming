import mongoose from "mongoose";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../src/modules/users/user.schema.ts";
import { Video } from "../src/modules/videos/video.schema.ts";
import { WatchHistory } from "../src/modules/analytics/watchHistory.schema.ts";

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (req: any, _res: any, next: any) => {
    const auth = req.headers.authorization as string | undefined;
    const token = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : undefined;
    if (token) req.auth = { userId: token };
    next();
  },
  requireAuth: () => (req: any, res: any, next: any) => {
    if (!req.auth?.userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    next();
  },
}));

vi.mock("svix", () => ({
  Webhook: class {
    constructor(_secret: string) {}
    verify(payload: string) {
      return JSON.parse(payload);
    }
  },
}));

let mongod: MongoMemoryServer;
let app: any;

beforeAll(async () => {
  process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "video-streaming-integration" });
  const mod = await import("../src/app.ts");
  app = mod.app;
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Webhook + Analytics integration", () => {
  it("accepts valid clerk webhook signature path and upserts user", async () => {
    const payload = {
      type: "user.created",
      data: {
        id: "clerk_user_123",
        username: "demo_user",
        image_url: "https://example.com/avatar.jpg",
        email_addresses: [{ email_address: "demo@example.com" }],
      },
    };

    const res = await request(app)
      .post("/api/webhooks/clerk")
      .set("svix-id", "msg_1")
      .set("svix-timestamp", `${Math.floor(Date.now() / 1000)}`)
      .set("svix-signature", "v1,test")
      .set("content-type", "application/json")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.received).toBe(true);

    const user = await User.findOne({ clerkId: "clerk_user_123" });
    expect(user).not.toBeNull();
    expect(user?.username).toBe("demo_user");
    expect(user?.email).toBe("demo@example.com");
  });

  it("upserts watch history from video_progress analytics event", async () => {
    const user = await User.create({
      clerkId: "clerk_progress_user",
      username: "progress_user",
      email: "p@example.com",
    });
    const video = await Video.create({
      title: "Track me",
      description: "video",
      uploaderId: "owner_1",
      imageKitFileId: "ikf1",
      imageKitUrl: "https://ik.imagekit.io/demo/v.mp4",
      imageKitPath: "/videos/v.mp4",
      visibility: "public",
      status: "ready",
    });

    const res = await request(app).post("/api/analytics/events").send([
      {
        sessionId: "sess_1",
        userId: "clerk_progress_user",
        videoId: String(video._id),
        eventType: "video_progress",
        metadata: {
          completionRate: 0.5,
          watchDuration: 120,
        },
        timestamp: new Date().toISOString(),
      },
    ]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inserted).toBe(1);

    const history = await WatchHistory.findOne({ userId: user._id, videoId: video._id });
    expect(history).not.toBeNull();
    expect(history?.completionRate).toBe(0.5);
    expect(history?.watchDuration).toBe(120);
  });
});
