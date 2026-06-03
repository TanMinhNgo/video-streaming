import dotenv from "dotenv";

dotenv.config({ quiet: process.env.NODE_ENV === "test" || process.env.CI === "true" });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI ?? "",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? "",
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? "",
  imagekitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ?? "",
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
};
