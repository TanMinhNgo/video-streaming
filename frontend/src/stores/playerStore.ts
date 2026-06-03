import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Video } from "@/types";

interface PlayerState {
  currentVideo: Video | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  setCurrentVideo: (video: Video | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentVideo: null,
      isPlaying: false,
      volume: 0.8,
      currentTime: 0,
      setCurrentVideo: (currentVideo) => set({ currentVideo }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume }),
      setCurrentTime: (currentTime) => set({ currentTime }),
    }),
    { name: "player-store", partialize: (s) => ({ volume: s.volume }) },
  ),
);

