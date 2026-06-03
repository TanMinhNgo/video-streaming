import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

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

vi.mock("../src/modules/videos/video.service.js", () => ({
  createVideo: vi.fn(),
  listPublicVideos: vi.fn(async () => ({
    data: [{ _id: "v1", title: "demo", visibility: "public", status: "ready" }],
    hasMore: false,
    nextCursor: null,
  })),
  getVideoById: vi.fn(),
  getVideoNoIncrement: vi.fn(),
  updateVideo: vi.fn(),
  deleteVideo: vi.fn(),
  getStreamUrl: vi.fn(),
  listRecommendations: vi.fn(async () => []),
  searchVideos: vi.fn(async () => []),
  toggleLike: vi.fn(),
  addComment: vi.fn(),
  listComments: vi.fn(async () => ({ data: [], hasMore: false, nextCursor: null })),
}));

vi.mock("../src/modules/analytics/analyticsEvent.schema.js", () => ({
  AnalyticsEvent: { insertMany: vi.fn(async () => []) },
}));
vi.mock("../src/modules/analytics/watchHistory.schema.js", () => ({
  WatchHistory: { findOneAndUpdate: vi.fn(async () => null), aggregate: vi.fn(async () => []) },
}));
vi.mock("../src/modules/users/user.schema.js", () => ({
  User: { findOne: vi.fn(async () => null), findById: vi.fn(async () => null), findOneAndUpdate: vi.fn(async () => null) },
}));
vi.mock("../src/modules/videos/video.schema.js", () => ({
  Video: { findById: vi.fn(async () => null), find: vi.fn(async () => []), countDocuments: vi.fn(async () => 0) },
}));

let app: any;

beforeAll(async () => {
  process.env.CLERK_WEBHOOK_SECRET = "whsec_test";
  const mod = await import("../src/app.ts");
  app = mod.app;
});

describe("Backend smoke tests", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });

  it("GET /api/videos returns paginated response", async () => {
    const res = await request(app).get("/api/videos");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });

  it("POST /api/webhooks/clerk rejects missing Svix headers", async () => {
    const res = await request(app).post("/api/webhooks/clerk").send({ type: "user.created", data: {} });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/analytics/events accepts valid batch payload", async () => {
    const res = await request(app).post("/api/analytics/events").send([
      {
        sessionId: "s1",
        userId: null,
        videoId: null,
        eventType: "page_view",
        metadata: { page: "home" },
        timestamp: new Date().toISOString(),
      },
    ]);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inserted).toBe(1);
  });
});
