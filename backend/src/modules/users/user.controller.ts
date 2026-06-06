import { Request, Response } from "express";
import { z } from "zod";
import { cacheDel, cacheGet, cacheSet } from "../../config/redis.ts";
import { User } from "./user.schema.ts";
import { Video } from "../videos/video.schema.ts";

const updateMeSchema = z.object({
  username: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

const ensureCurrentUser = async (clerkId: string) => {
  let user = await User.findOne({ clerkId });
  if (!user) {
    user = await User.create({ clerkId });
  }
  return user;
};

export const getMe = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return res.error("Unauthorized", 401);
  const cacheKey = `user:me:${clerkId}`;
  const cached = await cacheGet<Record<string, unknown>>(cacheKey);
  if (cached) return res.success(cached);
  const user = await ensureCurrentUser(clerkId);
  await cacheSet(cacheKey, user, 300);
  res.success(user);
};

export const updateMe = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return res.error("Unauthorized", 401);
  const payload = updateMeSchema.parse(req.body);
  const user = await User.findOneAndUpdate(
    { clerkId },
    { $set: payload },
    { returnDocument: "after", upsert: true },
  );
  await cacheDel(`user:me:${clerkId}`, `user:public:${user?._id}`);
  res.success(user);
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const cacheKey = `user:public:${req.params.id}`;
  const cached = await cacheGet<Record<string, unknown>>(cacheKey);
  if (cached) return res.success(cached);
  const profile = await User.findById(req.params.id);
  if (!profile) return res.error("User not found", 404);
  await cacheSet(cacheKey, profile, 300);
  res.success(profile);
};

export const toggleSubscribe = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return res.error("Unauthorized", 401);
  const target = await User.findById(req.params.id);
  if (!target) return res.error("User not found", 404);
  const me = await ensureCurrentUser(clerkId);

  const isSubscribed = me.subscriptions.includes(String(target._id));
  if (isSubscribed) {
    me.subscriptions = me.subscriptions.filter((id: string) => id !== String(target._id));
    target.subscriberCount = Math.max(0, target.subscriberCount - 1);
  } else {
    me.subscriptions.push(String(target._id));
    target.subscriberCount += 1;
  }
  await Promise.all([me.save(), target.save()]);
  await cacheDel(`user:me:${clerkId}`, `user:public:${target._id}`);
  res.success({ subscribed: !isSubscribed, subscriberCount: target.subscriberCount });
};

export const getSubscriptionFeed = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return res.error("Unauthorized", 401);
  const me = await User.findOne({ clerkId });
  if (!me?.subscriptions.length) return res.success([]);
  const creators = await User.find({ _id: { $in: me.subscriptions } }).select("clerkId");
  const creatorIds = creators.map((creator) => creator.clerkId);
  const videos = await Video.find({
    uploaderId: { $in: creatorIds },
    visibility: "public",
    status: "ready",
  })
    .sort({ createdAt: -1 })
    .limit(50);
  res.success(videos);
};
