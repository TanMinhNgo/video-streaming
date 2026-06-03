import mongoose from "mongoose";
import { env } from "./env.ts";

export const connectDb = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(env.mongodbUri, { maxPoolSize: 10 });
};
