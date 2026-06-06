import { NextFunction, Request, Response } from "express";
import { AnalyticsEvent } from "../modules/analytics/analyticsEvent.schema.ts";
import { getRequestUserId } from "./auth.ts";

type BufferedEvent = {
  sessionId: string;
  userId?: string;
  videoId?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
};

const buffer: BufferedEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;

const flush = async () => {
  if (!buffer.length) return;
  const docs = buffer.splice(0, buffer.length);
  await AnalyticsEvent.insertMany(docs, { ordered: false }).catch(() => undefined);
};

export const startTrackingBatch = () => {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    void flush();
  }, 30_000);
};

export const stopTrackingBatch = async () => {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = null;
  await flush();
};

export const trackingBatchMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  process.nextTick(() => {
    if (!req.path.startsWith("/api")) return;
    buffer.push({
      sessionId: req.header("x-session-id") || `${req.ip}:${Date.now()}`,
      userId: getRequestUserId(req),
      eventType: "api_call",
      metadata: { method: req.method, path: req.originalUrl },
      timestamp: new Date(),
    });
  });
  next();
};
