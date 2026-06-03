import mongoose from "mongoose";
import { app } from "./app.ts";
import { connectDb } from "./config/db.ts";
import { env } from "./config/env.ts";
import { logger } from "./config/logger.ts";
import { connectRedis, disconnectRedis } from "./config/redis.ts";
import { initSentry } from "./config/sentry.ts";
import { startTrackingBatch, stopTrackingBatch } from "./middleware/trackingBatch.ts";

initSentry();

const bootstrap = async () => {
  await connectDb();
  await connectRedis();
  startTrackingBatch();
  const server = app.listen(env.port, () => {
    logger.info({ message: `Backend listening on: http://localhost:${env.port}` });
  });

  process.on("SIGTERM", async () => {
    await stopTrackingBatch();
    await disconnectRedis();
    await mongoose.disconnect();
    server.close(() => process.exit(0));
  });
};

bootstrap().catch((error) => {
  logger.error({ message: "Failed to start server", error });
  process.exit(1);
});
