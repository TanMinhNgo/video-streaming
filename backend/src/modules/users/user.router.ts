import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { getMe, getPublicProfile, getSubscriptionFeed, toggleSubscribe, updateMe } from "./user.controller.ts";

export const userRouter = Router();

userRouter.get("/me", requireAuth(), asyncHandler(getMe));
userRouter.put("/me", requireAuth(), asyncHandler(updateMe));
userRouter.get("/subscriptions/feed", requireAuth(), asyncHandler(getSubscriptionFeed));
userRouter.get("/:id", asyncHandler(getPublicProfile));
userRouter.post("/:id/subscribe", requireAuth(), asyncHandler(toggleSubscribe));
