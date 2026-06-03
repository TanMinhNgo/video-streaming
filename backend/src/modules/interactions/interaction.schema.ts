import { Schema, model } from "mongoose";

const interactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    type: { type: String, enum: ["like", "dislike", "save"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

interactionSchema.index({ userId: 1, videoId: 1, type: 1 }, { unique: true });

export const Interaction = model("Interaction", interactionSchema);

