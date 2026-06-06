import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { getRequestUserId } from "../../middleware/auth.ts";
import {
  addComment,
  createVideo,
  deleteVideo,
  getStreamUrl,
  getVideoById,
  getVideoNoIncrement,
  listComments,
  listCreatorVideos,
  listPublicVideos,
  listRecommendations,
  listVideosByUserId,
  searchVideos,
  toggleLike,
  updateVideo,
} from "./video.service.ts";

const createVideoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageKitFileId: z.string().min(1),
  imageKitUrl: z.string().url(),
  imageKitPath: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  duration: z.number().nonnegative().optional(),
  fileSize: z.number().nonnegative().optional(),
  mimeType: z.string().max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
});

const updateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
});
const getId = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? "");
const getValidId = (value: string | string[] | undefined, res: Response) => {
  const id = getId(value);
  if (!mongoose.isValidObjectId(id)) {
    res.error("Invalid video id", 400);
    return null;
  }
  return id;
};

export const postVideo = async (req: Request, res: Response) => {
  const payload = createVideoSchema.parse(req.body);
  const uploaderId = getRequestUserId(req);
  if (!uploaderId) return res.error("Unauthorized", 401);
  const video = await createVideo({ ...payload, uploaderId });
  res.success(video, 201);
};

export const getVideos = async (req: Request, res: Response) => {
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  res.success(await listPublicVideos(cursor));
};

export const getMyVideos = async (req: Request, res: Response) => {
  const clerkId = getRequestUserId(req);
  if (!clerkId) return res.error("Unauthorized", 401);
  res.success(await listCreatorVideos(clerkId, true));
};

export const getCreatorVideos = async (req: Request, res: Response) => {
  const videos = await listVideosByUserId(getId(req.params.userId));
  if (!videos) return res.error("User not found", 404);
  res.success(videos);
};

export const getVideoDetail = async (req: Request, res: Response) => {
  const id = getValidId(req.params.id, res);
  if (!id) return;
  const video = await getVideoById(id, getRequestUserId(req));
  if (!video) return res.error("Video not found", 404);
  res.success(video);
};

export const putVideo = async (req: Request, res: Response) => {
  const uploaderId = getRequestUserId(req);
  if (!uploaderId) return res.error("Unauthorized", 401);
  const id = getValidId(req.params.id, res);
  if (!id) return;
  const payload = updateVideoSchema.parse(req.body);
  const video = await updateVideo(id, uploaderId, payload);
  if (!video) return res.error("Video not found or forbidden", 404);
  res.success(video);
};

export const removeVideo = async (req: Request, res: Response) => {
  const uploaderId = getRequestUserId(req);
  if (!uploaderId) return res.error("Unauthorized", 401);
  const id = getValidId(req.params.id, res);
  if (!id) return;
  const video = await deleteVideo(id, uploaderId);
  if (!video) return res.error("Video not found or forbidden", 404);
  res.success({ deleted: true });
};

export const getVideoStreamUrl = async (req: Request, res: Response) => {
  const id = getValidId(req.params.id, res);
  if (!id) return;
  const video = await getVideoNoIncrement(id, getRequestUserId(req));
  if (!video) return res.error("Video not found", 404);
  res.success({ streamUrl: getStreamUrl(video.imageKitPath, video.visibility === "private") });
};

export const getRecommendations = async (req: Request, res: Response) => {
  res.success(await listRecommendations(getRequestUserId(req)));
};

export const getSearch = async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) return res.success([]);
  res.success(await searchVideos(q.slice(0, 100)));
};

export const postLike = async (req: Request, res: Response) => {
  const clerkId = getRequestUserId(req);
  if (!clerkId) return res.error("Unauthorized", 401);
  const id = getValidId(req.params.id, res);
  if (!id) return;
  const result = await toggleLike(id, clerkId);
  if (!result) return res.error("Video or user not found", 404);
  res.success(result);
};

export const postComment = async (req: Request, res: Response) => {
  const clerkId = getRequestUserId(req);
  if (!clerkId) return res.error("Unauthorized", 401);
  const id = getValidId(req.params.id, res);
  if (!id) return;
  const content = z.object({ content: z.string().trim().min(1).max(500) }).parse(req.body).content;
  const comment = await addComment(id, clerkId, content);
  if (!comment) return res.error("User not found", 404);
  res.success(comment, 201);
};

export const getComments = async (req: Request, res: Response) => {
  const id = getValidId(req.params.id, res);
  if (!id) return;
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  res.success(await listComments(id, cursor));
};
