import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { getImageKitAuth } from "./imagekit.controller.js";

export const imagekitRouter = Router();

imagekitRouter.get("/auth", requireAuth(), getImageKitAuth);
