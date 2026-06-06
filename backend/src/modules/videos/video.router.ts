import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import {
  getComments,
  getCreatorVideos,
  getMyVideos,
  getRecommendations,
  getSearch,
  getVideoDetail,
  getVideos,
  getVideoStreamUrl,
  postComment,
  postLike,
  postVideo,
  putVideo,
  removeVideo,
} from "./video.controller.ts";

export const videoRouter = Router();

videoRouter.get("/recommendations", asyncHandler(getRecommendations));
videoRouter.get("/mine", requireAuth(), asyncHandler(getMyVideos));
videoRouter.get("/creator/:userId", asyncHandler(getCreatorVideos));
videoRouter.post("/", requireAuth(), asyncHandler(postVideo));
videoRouter.get("/", asyncHandler(getVideos));
videoRouter.get("/search", asyncHandler(getSearch));
videoRouter.post("/:id/like", requireAuth(), asyncHandler(postLike));
videoRouter.post("/:id/comment", requireAuth(), asyncHandler(postComment));
videoRouter.get("/:id/comments", asyncHandler(getComments));
videoRouter.put("/:id", requireAuth(), asyncHandler(putVideo));
videoRouter.delete("/:id", requireAuth(), asyncHandler(removeVideo));
videoRouter.get("/:id", asyncHandler(getVideoDetail));
videoRouter.get("/:id/stream-url", asyncHandler(getVideoStreamUrl));
