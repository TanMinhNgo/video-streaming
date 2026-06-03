import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTracking } from "@/hooks/useTracking";
import { fetchVideos } from "../api/videos";
import { VideoCard } from "@/components/video/VideoCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <main className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Discover Videos</h1>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Recommended clips, trending uploads, and your personalized feed.</p>
        </CardContent>
      </Card>
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
      <div ref={ref} className="py-2 text-center text-sm text-muted-foreground">{hasNextPage ? "Loading more..." : "You reached the end."}</div>
    </main>
  );
};
