import { Request, Response } from "express";
import { z } from "zod";
import { AnalyticsEvent } from "./analyticsEvent.schema.ts";
import { WatchHistory } from "./watchHistory.schema.ts";
import { User } from "../users/user.schema.ts";
import { Video } from "../videos/video.schema.ts";

const eventSchema = z.array(
  z.object({
    sessionId: z.string(),
    userId: z.string().optional().nullable(),
    videoId: z.string().optional().nullable(),
    eventType: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    timestamp: z.string().datetime().optional(),
  }),
);

export const postAnalyticsEvents = async (req: Request, res: Response) => {
  const payload = eventSchema.parse(req.body);
  const authenticatedUserId = req.auth?.userId ?? null;
  const docs = payload.map((e) => ({
    ...e,
    userId: authenticatedUserId,
    timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
  }));
  await AnalyticsEvent.insertMany(docs, { ordered: false });

  const progressEvents = payload.filter((e) => e.eventType === "video_progress" && authenticatedUserId && e.videoId);
  for (const event of progressEvents) {
    const user = await User.findOne({ clerkId: authenticatedUserId });
    if (!user || !event.videoId) continue;
    const completionRate = Number((event.metadata?.completionRate as number) ?? 0);
    const watchDuration = Number((event.metadata?.watchDuration as number) ?? 0);
    await WatchHistory.findOneAndUpdate(
      { userId: user._id, videoId: event.videoId },
      { $set: { watchedAt: new Date(), completionRate, watchDuration } },
      { upsert: true, returnDocument: "after" },
    );
  }

  res.success({ inserted: docs.length });
};

export const getVideoAnalytics = async (req: Request, res: Response) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.error("Video not found", 404);
  if (video.uploaderId !== req.auth?.userId) return res.error("Forbidden", 403);
  const watchStats = await WatchHistory.aggregate([
    { $match: { videoId: video._id } },
    { $group: { _id: "$videoId", avgCompletionRate: { $avg: "$completionRate" }, totalWatchDuration: { $sum: "$watchDuration" } } },
  ]);
  res.success({ video, watchStats: watchStats[0] ?? { avgCompletionRate: 0, totalWatchDuration: 0 } });
};

export const getAnalyticsDashboard = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  const videos = await Video.find({ uploaderId: clerkId, status: "ready" });
  const ids = videos.map((v) => v._id);
  const events = await AnalyticsEvent.countDocuments({ videoId: { $in: ids } });
  const totals = videos.reduce(
    (acc, v) => ({ views: acc.views + v.viewCount, likes: acc.likes + v.likeCount }),
    { views: 0, likes: 0 },
  );
  res.success({ videos: videos.length, views: totals.views, likes: totals.likes, events });
};

export const getWatchHistory = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return res.error("Unauthorized", 401);
  const user = await User.findOne({ clerkId });
  if (!user) return res.success([]);
  const history = await WatchHistory.find({ userId: user._id })
    .sort({ watchedAt: -1 })
    .limit(50)
    .populate({
      path: "videoId",
      match: { status: "ready", visibility: { $in: ["public", "unlisted"] } },
    });
  res.success(
    history
      .filter((entry) => entry.videoId)
      .map((entry) => ({
        video: entry.videoId,
        watchDuration: entry.watchDuration,
        completionRate: entry.completionRate,
        watchedAt: entry.watchedAt,
      })),
  );
};
