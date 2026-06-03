import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getMe, getPublicProfile, toggleSubscribe, updateMe } from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth(), asyncHandler(getMe));
userRouter.put("/me", requireAuth(), asyncHandler(updateMe));
userRouter.get("/:id", asyncHandler(getPublicProfile));
userRouter.post("/:id/subscribe", requireAuth(), asyncHandler(toggleSubscribe));

