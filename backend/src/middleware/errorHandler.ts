import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const message = err instanceof Error ? err.message : "Internal server error";

  logger.error({ error: message });
  Sentry.captureException(err);
  res.status(500).json({ success: false, error: message });
};
