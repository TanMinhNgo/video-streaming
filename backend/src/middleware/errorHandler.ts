import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env.ts";
import { logger } from "../config/logger.ts";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Invalid request",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, error: `Invalid ${err.path}` });
    return;
  }

  const mongoError = err as { code?: number };
  if (mongoError?.code === 11000) {
    res.status(409).json({ success: false, error: "Resource already exists" });
    return;
  }

  const internalMessage = err instanceof Error ? err.message : "Internal server error";
  const publicMessage = env.nodeEnv === "production" ? "Internal server error" : internalMessage;

  logger.error({ error: internalMessage });
  Sentry.captureException(err);
  res.status(500).json({ success: false, error: publicMessage });
};
