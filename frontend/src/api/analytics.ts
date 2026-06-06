import { api } from "./axios";
import type { Video } from "@/types";

type EventPayload = {
  sessionId: string;
  userId?: string;
  videoId?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
};

export const postEvents = async (events: EventPayload[]) => {
  await api.post("/analytics/events", events);
};

type ApiOk<T> = { success: true; data: T };

export type DashboardStats = {
  videos: number;
  views: number;
  likes: number;
  events: number;
};

export type HistoryEntry = {
  video: Video;
  watchDuration: number;
  completionRate: number;
  watchedAt: string;
};

export const fetchDashboard = async () => {
  const response = await api.get<ApiOk<DashboardStats>>("/analytics/dashboard");
  return response.data.data;
};

export const fetchHistory = async () => {
  const response = await api.get<ApiOk<HistoryEntry[]>>("/analytics/history");
  return response.data.data;
};
