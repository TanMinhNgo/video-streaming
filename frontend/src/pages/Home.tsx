import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTracking } from "@/hooks/useTracking";
import { fetchVideos } from "../api/videos";
import { VideoCard } from "@/components/video/VideoCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/utils";

export const HomePage = () => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["videos", "list"],
    queryFn: ({ pageParam }) => fetchVideos(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const { ref, inView } = useInView();
  const { track } = useTracking();
  useEffect(() => track("page_view", { page: "home" }), [track]);
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const videos = data?.pages.flatMap((p) => p.data) ?? [];
  const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
  const tags = Array.from(new Set(videos.flatMap((video) => video.tags))).slice(0, 8);

  return (
    <main className="space-y-4">
      <section className="rounded-lg border bg-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Discover videos ready for native MP4 streaming</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Browse sample uploads, test playback, inspect metadata, and validate creator workflows before production data is connected.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:min-w-80">
            <div className="rounded-md border bg-background p-3">
              <p className="text-muted-foreground">Videos</p>
              <strong className="text-xl">{videos.length || 6}</strong>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-muted-foreground">Views</p>
              <strong className="text-xl">{formatCount(totalViews || 259000)}</strong>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-muted-foreground">Mode</p>
              <strong className="text-xl">MP4</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(tags.length ? tags : ["streaming", "player", "creator"]).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </section>
      {isLoading && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-56 w-full" />
          ))}
        </section>
      )}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </section>
      <div ref={ref} className="py-2 text-center text-sm text-muted-foreground">{hasNextPage ? "Loading more..." : "End of feed"}</div>
    </main>
  );
};
