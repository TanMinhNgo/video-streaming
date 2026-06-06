import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.ts";
import { openApiDocument } from "./config/swagger.ts";
import { getRequestUserId } from "./middleware/auth.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { requestLogger } from "./middleware/requestLogger.ts";
import { hppLite, mongoSanitizeLite } from "./middleware/security.ts";
import { trackingBatchMiddleware } from "./middleware/trackingBatch.ts";
import { analyticsRouter } from "./modules/analytics/analytics.router.ts";
import { authRouter } from "./modules/auth/auth.router.ts";
import { imagekitRouter } from "./modules/imagekit/imagekit.router.ts";
import { userRouter } from "./modules/users/user.router.ts";
import { videoRouter } from "./modules/videos/video.router.ts";
import { getSearch } from "./modules/videos/video.controller.ts";
import { clerkWebhookRouter } from "./modules/webhooks/clerk.router.ts";
import { asyncHandler } from "./utils/asyncHandler.ts";
import { apiResponse } from "./utils/apiResponse.ts";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(apiResponse);
app.use("/api/webhooks", express.raw({ type: "application/json" }), clerkWebhookRouter);
app.use(express.json({ limit: "10mb" }));
app.use(mongoSanitizeLite);
app.use(hppLite);
app.use(clerkMiddleware({ secretKey: env.clerkSecretKey }));
app.use(requestLogger);
app.use(trackingBatchMiddleware);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: (req) => (getRequestUserId(req) ? 500 : 100),
  message: { error: "Too many requests" },
});

app.use("/api", limiter);
app.get("/health", (_req, res) => res.success({ status: "ok" }));
app.get("/api/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: "Video Streaming API" }));
app.use("/api/auth", authRouter);
app.use("/api/imagekit", imagekitRouter);
app.use("/api/videos", videoRouter);
app.get("/api/search", asyncHandler(getSearch));
app.use("/api/users", userRouter);
app.use("/api/analytics", analyticsRouter);

app.use(errorHandler);
