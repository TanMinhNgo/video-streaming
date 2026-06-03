import { api } from "./axios";

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

