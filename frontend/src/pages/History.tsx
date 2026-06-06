import { useQuery } from "@tanstack/react-query";
import { fetchHistory } from "@/api/analytics";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard } from "@/components/video/VideoCard";

export const HistoryPage = () => {
  const query = useQuery({ queryKey: ["analytics", "history"], queryFn: fetchHistory });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Lịch sử xem</h1>
        <p className="mt-1 text-sm text-muted-foreground">Video được ghi nhận khi bạn xem qua các mốc tiến độ.</p>
      </div>
      {query.isLoading ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-56" />)}</section>
      ) : query.isError ? (
        <ErrorState title="Không thể tải lịch sử" description="Đã có lỗi khi lấy hoạt động xem của bạn." onRetry={() => void query.refetch()} />
      ) : query.data?.length ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {query.data.map((entry) => <VideoCard key={entry.video._id} video={entry.video} />)}
        </section>
      ) : (
        <EmptyState title="Chưa có lịch sử xem" description="Các video bạn đã xem sẽ xuất hiện tại đây." />
      )}
    </div>
  );
};
