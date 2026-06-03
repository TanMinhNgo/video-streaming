import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useTrackingStore } from "@/stores/trackingStore";

export const useTracking = (videoId?: string) => {
  const { userId } = useAuth();
  const addEvent = useTrackingStore((s) => s.addEvent);
  const track = useCallback(
    (eventType: string, metadata?: Record<string, unknown>) => {
      addEvent({ eventType, videoId, userId: userId ?? undefined, metadata });
    },
    [addEvent, userId, videoId],
  );
  return { track };
};

