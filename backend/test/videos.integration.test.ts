import mongoose from "mongoose";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

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

const mockImageKit = {
  deleteFile: vi.fn(async () => undefined),
  url: vi.fn(() => "https://example.com/stream.mp4"),
  getAuthenticationParameters: vi.fn(() => ({ token: "t", expire: 1, signature: "s" })),
};

vi.mock("../src/config/imagekit.js", () => ({
  getImageKit: () => mockImageKit,
}));

let mongod: MongoMemoryServer;
let app: any;

const authHeader = { Authorization: "Bearer test-user" };

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "video-streaming-test" });
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

describe("Videos integration", () => {
  it("creates, updates and deletes a video", async () => {
    const createRes = await request(app).post("/api/videos").set(authHeader).send({
      title: "Integration test video",
      description: "demo",
      imageKitFileId: "ik-file-1",
      imageKitUrl: "https://ik.imagekit.io/demo/video.mp4",
      imageKitPath: "/videos/test/video.mp4",
      thumbnailUrl: "https://ik.imagekit.io/demo/thumb.jpg",
      tags: ["test", "integration"],
      visibility: "public",
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const id = createRes.body.data._id as string;

    const listRes = await request(app).get("/api/videos");
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.data.length).toBe(1);

    const updateRes = await request(app).put(`/api/videos/${id}`).set(authHeader).send({
      title: "Updated title",
      tags: ["updated"],
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe("Updated title");

    const deleteRes = await request(app).delete(`/api/videos/${id}`).set(authHeader);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.deleted).toBe(true);

    const listAfterDelete = await request(app).get("/api/videos");
    expect(listAfterDelete.status).toBe(200);
    expect(listAfterDelete.body.data.data.length).toBe(0);
  });

  it("requires auth on protected video routes", async () => {
    const res = await request(app).post("/api/videos").send({
      title: "No auth",
      imageKitFileId: "ik-file-2",
      imageKitUrl: "https://ik.imagekit.io/demo/video2.mp4",
      imageKitPath: "/videos/test/video2.mp4",
    });
    expect(res.status).toBe(401);
  });

  it("only lets the owner access a private video and its stream URL", async () => {
    const createRes = await request(app).post("/api/videos").set(authHeader).send({
      title: "Private video",
      imageKitFileId: "ik-private",
      imageKitUrl: "https://ik.imagekit.io/demo/private.mp4",
      imageKitPath: "/videos/test/private.mp4",
      visibility: "private",
    });
    const id = createRes.body.data._id as string;

    expect((await request(app).get(`/api/videos/${id}`)).status).toBe(404);
    expect((await request(app).get(`/api/videos/${id}/stream-url`)).status).toBe(404);

    const ownerDetail = await request(app).get(`/api/videos/${id}`).set(authHeader);
    expect(ownerDetail.status).toBe(200);

    const ownerStream = await request(app).get(`/api/videos/${id}/stream-url`).set(authHeader);
    expect(ownerStream.status).toBe(200);
    expect(ownerStream.body.data.streamUrl).toBe("https://example.com/stream.mp4");
  });

  it("returns 400 for invalid ids and validation failures", async () => {
    const invalidId = await request(app).get("/api/videos/not-an-object-id");
    expect(invalidId.status).toBe(400);

    const invalidPayload = await request(app).post("/api/videos").set(authHeader).send({
      title: "",
      imageKitFileId: "ik-invalid",
      imageKitUrl: "not-a-url",
      imageKitPath: "/videos/test/invalid.mp4",
    });
    expect(invalidPayload.status).toBe(400);
    expect(invalidPayload.body.error).toBe("Invalid request");
  });
});
