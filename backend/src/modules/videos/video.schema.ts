import { Schema, model } from "mongoose";

const videoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    uploaderId: { type: String, required: true, index: true },
    imageKitFileId: { type: String, required: true },
    imageKitUrl: { type: String, required: true },
    imageKitPath: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    tags: { type: [String], default: [] },
    visibility: { type: String, enum: ["public", "private", "unlisted"], default: "public" },
    status: { type: String, enum: ["uploading", "ready", "deleted"], default: "ready" },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

videoSchema.index({ createdAt: -1 });

export const Video = model("Video", videoSchema);
