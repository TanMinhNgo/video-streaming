import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const redis = env.redisUrl ? new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 }) : null;

export const connectRedis = async () => {
  if (!redis) return;
  try {
    await redis.connect();
    logger.info({ message: "Redis connected" });
  } catch (error) {
    logger.warn({ message: "Redis unavailable, falling back to DB only", error });
  }
};

export const disconnectRedis = async () => {
  if (!redis) return;
  await redis.quit().catch(() => undefined);
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redis || redis.status !== "ready") return null;
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 300) => {
  if (!redis || redis.status !== "ready") return;
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};

export const cacheDel = async (...keys: string[]) => {
  if (!redis || redis.status !== "ready" || !keys.length) return;
  await redis.del(...keys);
};
