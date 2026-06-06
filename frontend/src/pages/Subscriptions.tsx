import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptionFeed } from "@/api/users";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard } from "@/components/video/VideoCard";

export const SubscriptionsPage = () => {
  const query = useQuery({ queryKey: ["subscriptions", "feed"], queryFn: fetchSubscriptionFeed });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Kênh đăng ký</h1>
        <p className="mt-1 text-sm text-muted-foreground">Video mới nhất từ các creator bạn đang theo dõi.</p>
      </div>
      {query.isLoading ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-56" />)}</section>
      ) : query.isError ? (
        <ErrorState title="Không thể tải feed đăng ký" description="Đã có lỗi khi lấy video từ các kênh của bạn." onRetry={() => void query.refetch()} />
      ) : query.data?.length ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{query.data.map((video) => <VideoCard key={video._id} video={video} />)}</section>
      ) : (
        <EmptyState title="Feed đăng ký đang trống" description="Theo dõi một creator để xem video mới của họ tại đây." />
      )}
    </div>
  );
};
