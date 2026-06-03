import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.ts";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Date.now() - start,
      userId: req.auth?.userId ?? null,
    });
  });
  next();
};
