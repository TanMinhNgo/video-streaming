import { Router } from "express";
import { getAuthStatus } from "./auth.controller.ts";

export const authRouter = Router();

authRouter.get("/status", getAuthStatus);
