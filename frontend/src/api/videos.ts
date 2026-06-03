import { api } from "./axios";
import type { Comment, Paginated, Video } from "@/types";
import { findSampleVideo, sampleComments, sampleVideos, searchSampleVideos, toPaginatedVideos } from "@/lib/sampleData";

type ApiOk<T> = { success: true; data: T };

export const fetchVideos = async (cursor?: string) => {
  try {
    const response = await api.get<ApiOk<Paginated<Video>>>("/videos", { params: { cursor } });
    return response.data.data.data.length ? response.data.data : toPaginatedVideos();
  } catch {
    return toPaginatedVideos();
  }
};

export const fetchVideoDetail = async (id: string) => {
  try {
    const response = await api.get<ApiOk<Video>>(`/videos/${id}`);
    return response.data.data;
  } catch {
    return findSampleVideo(id);
  }
};

export const fetchRecommendations = async () => {
  try {
    const response = await api.get<ApiOk<Video[]>>("/videos/recommendations");
    return response.data.data.length ? response.data.data : sampleVideos.slice(0, 4);
  } catch {
    return sampleVideos.slice(0, 4);
  }
};

export const fetchSearch = async (q: string) => {
  try {
    const response = await api.get<ApiOk<Video[]>>("/search", { params: { q } });
    return response.data.data.length ? response.data.data : searchSampleVideos(q);
  } catch {
    return searchSampleVideos(q);
  }
};

export const fetchComments = async (id: string, cursor?: string) => {
  try {
    const response = await api.get<ApiOk<Paginated<Comment>>>(`/videos/${id}/comments`, { params: { cursor } });
    return response.data.data.data.length ? response.data.data : { data: sampleComments, hasMore: false, nextCursor: null };
  } catch {
    return { data: sampleComments, hasMore: false, nextCursor: null };
  }
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
  try {
    const response = await api.get<ApiOk<{ streamUrl: string }>>(`/videos/${id}/stream-url`);
    return response.data.data.streamUrl;
  } catch {
    return findSampleVideo(id).imageKitUrl;
  }
};

export const createVideo = async (payload: Record<string, unknown>, token: string) => {
  const response = await api.post<ApiOk<Video>>("/videos", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
