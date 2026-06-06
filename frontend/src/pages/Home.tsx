import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTracking } from "@/hooks/useTracking";
import { fetchVideos } from "../api/videos";
import { VideoCard } from "@/components/video/VideoCard";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/utils";

export const HomePage = () => {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
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
    <div className="space-y-4">
      <section className="rounded-lg border bg-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">Khám phá video mới trên StreamBox</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Xem video MP4 trực tiếp, theo dõi creator và tìm nội dung theo chủ đề bạn quan tâm.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:min-w-80">
            <div className="col-span-2 rounded-md border bg-background p-3 sm:col-span-1">
              <p className="text-muted-foreground">Đã tải</p>
              <strong className="text-xl tabular-nums">{videos.length}</strong>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-muted-foreground">Lượt xem</p>
              <strong className="text-xl tabular-nums">{formatCount(totalViews)}</strong>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-muted-foreground">Mode</p>
              <strong className="text-xl">MP4</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
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
      {isError ? (
        <ErrorState title="Không thể tải video" description="Máy chủ chưa phản hồi hoặc kết nối đang gián đoạn." onRetry={() => void refetch()} />
      ) : !isLoading && videos.length === 0 ? (
        <EmptyState title="Chưa có video công khai" description="Video mới sẽ xuất hiện ở đây sau khi creator tải lên và công khai." />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </section>
      )}
      {videos.length > 0 ? (
        <div ref={ref} className="py-3 text-center text-sm text-muted-foreground">
          {isFetchingNextPage ? "Đang tải thêm..." : hasNextPage ? "Cuộn để xem thêm" : "Bạn đã xem hết danh sách"}
        </div>
      ) : null}
    </div>
  );
};
