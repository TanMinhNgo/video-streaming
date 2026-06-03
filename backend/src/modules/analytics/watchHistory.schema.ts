import { Schema, model } from "mongoose";

const watchHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    watchDuration: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    watchedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

watchHistorySchema.index({ userId: 1, watchedAt: -1 });

export const WatchHistory = model("WatchHistory", watchHistorySchema);

