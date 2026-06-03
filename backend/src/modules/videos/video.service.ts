import mongoose from "mongoose";
import { cacheDel, cacheGet, cacheSet } from "../../config/redis.js";
import { getImageKit } from "../../config/imagekit.js";
import { AnalyticsEvent } from "../analytics/analyticsEvent.schema.js";
import { WatchHistory } from "../analytics/watchHistory.schema.js";
import { Comment } from "../comments/comment.schema.js";
import { Interaction } from "../interactions/interaction.schema.js";
import { User } from "../users/user.schema.js";
import { Video } from "./video.schema.js";

export const createVideo = async (payload: Record<string, unknown>) => Video.create(payload);

export const listPublicVideos = async (cursor?: string, limit = 12) => {
  const key = `videos:list:${cursor ?? "first"}:${limit}`;
  const cached = await cacheGet<{ data: unknown[]; hasMore: boolean; nextCursor: string | null }>(key);
  if (cached) return cached;
  const query: Record<string, unknown> = { visibility: "public", status: "ready" };
  if (cursor) query._id = { $lt: cursor };
  const videos = await Video.find(query).sort({ _id: -1 }).limit(limit + 1);
  const hasMore = videos.length > limit;
  const result = { data: videos.slice(0, limit), hasMore, nextCursor: hasMore ? videos[limit - 1]?._id : null };
  await cacheSet(key, result, 120);
  return result;
};

export const getVideoById = async (id: string) => {
  const key = `video:${id}`;
  const cached = await cacheGet<Record<string, unknown>>(key);
  if (cached) {
    await Video.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    const next = { ...cached, viewCount: Number(cached.viewCount ?? 0) + 1 };
    await cacheSet(key, next, 300);
    return next as unknown as Awaited<ReturnType<typeof Video.findById>>;
  }
  const video = await Video.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { returnDocument: "after" });
  if (video) await cacheSet(key, video, 300);
  return video;
};
export const getVideoNoIncrement = async (id: string) => {
  const key = `video:${id}`;
  const cached = await cacheGet<Record<string, unknown>>(key);
  if (cached) return cached as unknown as Awaited<ReturnType<typeof Video.findById>>;
  const video = await Video.findById(id);
  if (video) await cacheSet(key, video, 300);
  return video;
};

export const updateVideo = async (id: string, uploaderId: string, payload: Record<string, unknown>) =>
  Video.findOneAndUpdate({ _id: id, uploaderId }, { $set: payload }, { returnDocument: "after" }).then(async (video) => {
    await cacheDel(`video:${id}`);
    return video;
  });

export const deleteVideo = async (id: string, uploaderId: string) => {
  const video = await Video.findOne({ _id: id, uploaderId });
  if (!video) return null;
  if (video.imageKitFileId) await getImageKit().deleteFile(video.imageKitFileId).catch(() => undefined);
  video.status = "deleted";
  await video.save();
  await cacheDel(`video:${id}`);
  return video;
};

export const getStreamUrl = (path: string, isPrivate = false) =>
  getImageKit().url({ path, transformation: [{ format: "mp4" }], ...(isPrivate ? { signed: true, expireSeconds: 3600 } : {}) });

export const listRecommendations = async (clerkId?: string) => {
  if (!clerkId) {
    return Video.find({ visibility: "public", status: "ready" }).sort({ viewCount: -1, createdAt: -1 }).limit(20);
  }
  const user = await User.findOne({ clerkId });
  if (!user) return Video.find({ visibility: "public", status: "ready" }).sort({ viewCount: -1 }).limit(20);
  const watched = await WatchHistory.find({ userId: user._id }).sort({ watchedAt: -1 }).limit(10).populate("videoId");
  const userTags = Array.from(
    new Set(watched.flatMap((w: any) => (w.videoId?.tags ? w.videoId.tags : []))),
  );
  const watchedIds = watched.map((w) => w.videoId?._id).filter(Boolean);
  if (!userTags.length) return Video.find({ visibility: "public", status: "ready" }).sort({ viewCount: -1 }).limit(20);

  const pipeline: any[] = [
    { $match: { tags: { $in: userTags }, _id: { $nin: watchedIds }, visibility: "public", status: "ready" } },
    { $addFields: { score: { $size: { $setIntersection: ["$tags", userTags] } } } },
    { $sort: { score: -1 as const, viewCount: -1 as const } },
    { $limit: 20 },
  ];
  return Video.aggregate(pipeline);
};

export const searchVideos = async (q: string) =>
  Video.find({
    visibility: "public",
    status: "ready",
    $or: [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }, { tags: { $in: [new RegExp(q, "i")] } }],
  })
    .sort({ viewCount: -1 })
    .limit(30);

export const toggleLike = async (videoId: string, clerkId: string) => {
  const user = await User.findOne({ clerkId });
  if (!user) return null;
  const existing = await Interaction.findOne({ userId: user._id, videoId, type: "like" });
  const video = await Video.findById(videoId);
  if (!video) return null;
  if (existing) {
    await existing.deleteOne();
    video.likeCount = Math.max(0, video.likeCount - 1);
    await video.save();
    await cacheDel(`video:${videoId}`);
    return { liked: false, likeCount: video.likeCount };
  }
  await Interaction.create({ userId: user._id, videoId, type: "like" });
  video.likeCount += 1;
  await video.save();
  await cacheDel(`video:${videoId}`);
  return { liked: true, likeCount: video.likeCount };
};

export const addComment = async (videoId: string, clerkId: string, content: string) => {
  const user = await User.findOne({ clerkId });
  if (!user) return null;
  const comment = await Comment.create({ videoId: new mongoose.Types.ObjectId(videoId), userId: user._id, content });
  await cacheDel(`comments:${videoId}:first:20`);
  return comment;
};

export const listComments = async (videoId: string, cursor?: string, limit = 20) => {
  const key = `comments:${videoId}:${cursor ?? "first"}:${limit}`;
  const cached = await cacheGet<{ data: unknown[]; hasMore: boolean; nextCursor: string | null }>(key);
  if (cached) return cached;
  const query: Record<string, unknown> = { videoId: new mongoose.Types.ObjectId(videoId) };
  if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  const comments = await Comment.find(query).sort({ _id: -1 }).limit(limit + 1).populate("userId", "username avatar");
  const hasMore = comments.length > limit;
  const result = { data: comments.slice(0, limit), hasMore, nextCursor: hasMore ? comments[limit - 1]?._id : null };
  await cacheSet(key, result, 120);
  return result;
};

export const insertAnalyticsEvents = async (events: Array<Record<string, unknown>>) => AnalyticsEvent.insertMany(events, { ordered: false });
