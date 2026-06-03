import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getAnalyticsDashboard, getVideoAnalytics, postAnalyticsEvents } from "./analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.post("/events", asyncHandler(postAnalyticsEvents));
analyticsRouter.get("/videos/:id", requireAuth(), asyncHandler(getVideoAnalytics));
analyticsRouter.get("/dashboard", requireAuth(), asyncHandler(getAnalyticsDashboard));

