import { useMemo, useRef } from "react";
import type { Video } from "../../types";
import { useTracking } from "@/hooks/useTracking";
import { usePlayerStore } from "@/stores/playerStore";

export const VideoPlayer = ({ video, streamUrl }: { video: Video; streamUrl?: string }) => {
  const src = useMemo(() => streamUrl || video.imageKitUrl, [streamUrl, video.imageKitUrl]);
  const ref = useRef<HTMLVideoElement>(null);
  const { track } = useTracking(video._id);
  const volume = usePlayerStore((s) => s.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);

  return (
    <div className="overflow-hidden rounded-lg border bg-black shadow-sm">
      <video
        ref={ref}
        controls
        preload="metadata"
        className="aspect-video max-h-[540px] w-full bg-black object-contain"
        src={src}
        onPlay={() => track("video_play")}
        onPause={() => track("video_pause")}
        onEnded={() => track("video_ended")}
        onSeeked={() => track("video_seek", { currentTime: ref.current?.currentTime })}
        onVolumeChange={() => {
          if (typeof ref.current?.volume === "number") setVolume(ref.current.volume);
        }}
        onLoadedMetadata={() => {
          if (ref.current) ref.current.volume = volume;
        }}
      />
    </div>
  );
};
