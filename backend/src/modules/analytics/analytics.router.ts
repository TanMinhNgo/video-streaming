import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { getAnalyticsDashboard, getVideoAnalytics, getWatchHistory, postAnalyticsEvents } from "./analytics.controller.ts";

export const analyticsRouter = Router();

analyticsRouter.post("/events", asyncHandler(postAnalyticsEvents));
analyticsRouter.get("/videos/:id", requireAuth(), asyncHandler(getVideoAnalytics));
analyticsRouter.get("/dashboard", requireAuth(), asyncHandler(getAnalyticsDashboard));
analyticsRouter.get("/history", requireAuth(), asyncHandler(getWatchHistory));
