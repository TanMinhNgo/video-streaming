import { api } from "./axios";
import type { Comment, Paginated, Video } from "@/types";

type ApiOk<T> = { success: true; data: T };

export const fetchVideos = async (cursor?: string) => {
  const response = await api.get<ApiOk<Paginated<Video>>>("/videos", { params: { cursor } });
  return response.data.data;
};

export const fetchVideoDetail = async (id: string) => {
  const response = await api.get<ApiOk<Video>>(`/videos/${id}`);
  return response.data.data;
};

export const fetchRecommendations = async () => {
  const response = await api.get<ApiOk<Video[]>>("/videos/recommendations");
  return response.data.data;
};

export const fetchSearch = async (q: string) => {
  const response = await api.get<ApiOk<Video[]>>("/search", { params: { q } });
  return response.data.data;
};

export const fetchComments = async (id: string, cursor?: string) => {
  const response = await api.get<ApiOk<Paginated<Comment>>>(`/videos/${id}/comments`, { params: { cursor } });
  return response.data.data;
};

export const postComment = async (id: string, content: string, token: string) => {
  const response = await api.post<ApiOk<Comment>>(
    `/videos/${id}/comment`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const toggleLike = async (id: string, token: string) => {
  const response = await api.post<ApiOk<{ liked: boolean; likeCount: number }>>(
    `/videos/${id}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
};

export const fetchStreamUrl = async (id: string) => {
  const response = await api.get<ApiOk<{ streamUrl: string }>>(`/videos/${id}/stream-url`);
  return response.data.data.streamUrl;
};

export const createVideo = async (payload: Record<string, unknown>, token: string) => {
  const response = await api.post<ApiOk<Video>>("/videos", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const fetchMyVideos = async () => {
  const response = await api.get<ApiOk<Video[]>>("/videos/mine");
  return response.data.data;
};

export const fetchCreatorVideos = async (userId: string) => {
  const response = await api.get<ApiOk<Video[]>>(`/videos/creator/${userId}`);
  return response.data.data;
};

export const deleteVideo = async (id: string) => {
  await api.delete(`/videos/${id}`);
};
