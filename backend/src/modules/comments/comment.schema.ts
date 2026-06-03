import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    videoId: { type: Schema.Types.ObjectId, ref: "Video", index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    content: { type: String, required: true, maxlength: 500 },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Comment = model("Comment", commentSchema);

