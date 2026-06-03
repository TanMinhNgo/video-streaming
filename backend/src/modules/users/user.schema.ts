import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    username: { type: String, default: "" },
    email: { type: String, default: "" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    subscriberCount: { type: Number, default: 0 },
    subscriptions: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const User = model("User", userSchema);
