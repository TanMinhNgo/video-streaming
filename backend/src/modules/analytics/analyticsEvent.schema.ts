import { Schema, model } from "mongoose";

const analyticsEventSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, default: null },
    videoId: { type: Schema.Types.ObjectId, ref: "Video", default: null },
    eventType: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export const AnalyticsEvent = model("AnalyticsEvent", analyticsEventSchema);
