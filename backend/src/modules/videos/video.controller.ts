import { Request, Response } from "express";
import { z } from "zod";
import {
  addComment,
  createVideo,
  deleteVideo,
  getStreamUrl,
  getVideoById,
  getVideoNoIncrement,
  listComments,
  listPublicVideos,
  listRecommendations,
  searchVideos,
  toggleLike,
  updateVideo,
} from "./video.service.js";

const createVideoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageKitFileId: z.string().min(1),
  imageKitUrl: z.string().url(),
  imageKitPath: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  duration: z.number().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
});

const updateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
});
const getId = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? "");

export const postVideo = async (req: Request, res: Response) => {
  const payload = createVideoSchema.parse(req.body);
  const uploaderId = req.auth?.userId;
  if (!uploaderId) return res.error("Unauthorized", 401);
  const video = await createVideo({ ...payload, uploaderId });
  res.success(video, 201);
};

export const getVideos = async (req: Request, res: Response) => {
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  res.success(await listPublicVideos(cursor));
};

export const getVideoDetail = async (req: Request, res: Response) => {
  const video = await getVideoById(getId(req.params.id));
  if (!video) return res.error("Video not found", 404);
  res.success(video);
};

export const putVideo = async (req: Request, res: Response) => {
  const uploaderId = req.auth?.userId;
  if (!uploaderId) return res.error("Unauthorized", 401);
  const payload = updateVideoSchema.parse(req.body);
  const video = await updateVideo(getId(req.params.id), uploaderId, payload);
  if (!video) return res.error("Video not found or forbidden", 404);
  res.success(video);
};

export const removeVideo = async (req: Request, res: Response) => {
  const uploaderId = req.auth?.userId;
  if (!uploaderId) return res.error("Unauthorized", 401);
  const video = await deleteVideo(getId(req.params.id), uploaderId);
  if (!video) return res.error("Video not found or forbidden", 404);
  res.success({ deleted: true });
};

export const getVideoStreamUrl = async (req: Request, res: Response) => {
  const video = (await getVideoNoIncrement(getId(req.params.id))) as any;
  if (!video) return res.error("Video not found", 404);
  res.success({ streamUrl: getStreamUrl(video.imageKitPath, video.visibility === "private") });
};

export const getRecommendations = async (req: Request, res: Response) => {
  res.success(await listRecommendations(req.auth?.userId));
};

export const getSearch = async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) return res.success([]);
  res.success(await searchVideos(q));
};

export const postLike = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return res.error("Unauthorized", 401);
  const result = await toggleLike(getId(req.params.id), clerkId);
  if (!result) return res.error("Video or user not found", 404);
  res.success(result);
};

export const postComment = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId;
  if (!clerkId) return res.error("Unauthorized", 401);
  const content = z.object({ content: z.string().min(1).max(500) }).parse(req.body).content;
  const comment = await addComment(getId(req.params.id), clerkId, content);
  if (!comment) return res.error("User not found", 404);
  res.success(comment, 201);
};

export const getComments = async (req: Request, res: Response) => {
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  res.success(await listComments(getId(req.params.id), cursor));
};
