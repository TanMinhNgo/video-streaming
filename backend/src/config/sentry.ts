import * as Sentry from "@sentry/node";
import { env } from "./env.js";

export const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: env.nodeEnv,
    tracesSampleRate: env.nodeEnv === "production" ? 0.2 : 1.0,
    integrations: [Sentry.mongooseIntegration()],
  });
};
