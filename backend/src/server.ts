import mongoose from "mongoose";
import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { initSentry } from "./config/sentry.js";
import { startTrackingBatch, stopTrackingBatch } from "./middleware/trackingBatch.js";

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
