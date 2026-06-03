import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { hppLite, mongoSanitizeLite } from "./middleware/security.js";
import { trackingBatchMiddleware } from "./middleware/trackingBatch.js";
import { analyticsRouter } from "./modules/analytics/analytics.router.js";
import { imagekitRouter } from "./modules/imagekit/imagekit.router.js";
import { userRouter } from "./modules/users/user.router.js";
import { videoRouter } from "./modules/videos/video.router.js";
import { getSearch } from "./modules/videos/video.controller.js";
import { clerkWebhookRouter } from "./modules/webhooks/clerk.router.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { apiResponse } from "./utils/apiResponse.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(apiResponse);
app.use("/api/webhooks", express.raw({ type: "application/json" }), clerkWebhookRouter);
app.use(express.json({ limit: "10mb" }));
app.use(mongoSanitizeLite);
app.use(hppLite);
app.use(clerkMiddleware());
app.use(requestLogger);
app.use(trackingBatchMiddleware);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: (req) => (req.auth?.userId ? 500 : 100),
  message: { error: "Too many requests" },
});

app.use("/api", limiter);
app.get("/health", (_req, res) => res.success({ status: "ok" }));
app.use("/api/imagekit", imagekitRouter);
app.use("/api/videos", videoRouter);
app.get("/api/search", asyncHandler(getSearch));
app.use("/api/users", userRouter);
app.use("/api/analytics", analyticsRouter);

app.use(errorHandler);
