import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { postEvents } from "@/api/analytics";

export interface TrackingEvent {
  sessionId: string;
  userId?: string;
  videoId?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface TrackingState {
  sessionId: string;
  events: TrackingEvent[];
  addEvent: (event: Omit<TrackingEvent, "sessionId" | "timestamp">) => void;
  flush: () => Promise<void>;
}

const getSessionId = () => {
  const key = "video_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const next = uuid();
  sessionStorage.setItem(key, next);
  return next;
};

export const useTrackingStore = create<TrackingState>((set, get) => ({
  sessionId: getSessionId(),
  events: [],
  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          ...event,
          sessionId: state.sessionId,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  flush: async () => {
    const events = get().events;
    if (!events.length) return;
    set({ events: [] });
    await postEvents(events).catch(() => undefined);
  },
}));

