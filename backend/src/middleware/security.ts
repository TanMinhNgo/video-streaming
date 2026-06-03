import { NextFunction, Request, Response } from "express";

const sanitizeObject = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (!value || typeof value !== "object") return value;

  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    obj[key] = sanitizeObject(obj[key]);
  }
  return obj;
};

const dedupeQueryObject = (value: unknown): unknown => {
  if (Array.isArray(value)) return value[0];
  if (!value || typeof value !== "object") return value;
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    obj[key] = dedupeQueryObject(obj[key]);
  }
  return obj;
};

export const mongoSanitizeLite = (req: Request, _res: Response, next: NextFunction) => {
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  sanitizeObject(req.query);
  next();
};

export const hppLite = (req: Request, _res: Response, next: NextFunction) => {
  dedupeQueryObject(req.query);
  next();
};

