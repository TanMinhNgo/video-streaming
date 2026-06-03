import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { getImageKitAuth } from "./imagekit.controller.ts";

export const imagekitRouter = Router();

imagekitRouter.get("/auth", requireAuth(), getImageKitAuth);
