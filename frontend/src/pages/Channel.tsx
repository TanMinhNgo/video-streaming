import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchMe, fetchUserProfile } from "@/api/users";
import { fetchCreatorVideos } from "@/api/videos";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard } from "@/components/video/VideoCard";
import { formatCount } from "@/lib/utils";

export const ChannelPage = () => {
  const { id = "" } = useParams();
  const { getToken, userId } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["user", id, id === "me" ? userId : null],
    queryFn: async () => {
      if (id !== "me") return fetchUserProfile(id);
      const token = await getToken();
      if (!token) throw new Error("Authentication required");
      return fetchMe(token);
    },
    enabled: !!id,
  });
  const videosQuery = useQuery({
    queryKey: ["videos", "creator", profileQuery.data?._id],
    queryFn: () => fetchCreatorVideos(profileQuery.data!._id),
    enabled: !!profileQuery.data?._id,
  });

  if (profileQuery.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <ErrorState title="Không thể tải kênh" description="Kênh không tồn tại hoặc máy chủ chưa phản hồi." onRetry={() => void profileQuery.refetch()} />;
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center">
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className="size-20 rounded-xl object-cover" />
        ) : (
          <div className="grid size-20 place-items-center rounded-xl bg-foreground text-xl font-semibold text-background">{(profile.username || "C").slice(0, 1).toUpperCase()}</div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{profile.username || "Kênh chưa đặt tên"}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{profile.bio || "Creator chưa cập nhật giới thiệu."}</p>
          <span className="mt-1 block text-sm text-muted-foreground">{formatCount(profile.subscriberCount)} người đăng ký</span>
        </div>
      </section>
      {videosQuery.isLoading ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-56" />)}</section>
      ) : videosQuery.isError ? (
        <ErrorState title="Không thể tải video của kênh" description="Hãy thử tải lại danh sách." onRetry={() => void videosQuery.refetch()} />
      ) : videosQuery.data?.length ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videosQuery.data.map((video) => <VideoCard key={video._id} video={video} />)}
        </section>
      ) : (
        <EmptyState title="Kênh chưa có video" description="Các video công khai của creator sẽ xuất hiện tại đây." />
      )}
    </div>
  );
};
