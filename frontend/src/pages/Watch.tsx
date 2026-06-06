import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchComments, fetchRecommendations, fetchStreamUrl, fetchVideoDetail, postComment, toggleLike } from "@/api/videos";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { VideoCard } from "@/components/video/VideoCard";
import { useTracking } from "@/hooks/useTracking";
import { formatCount } from "@/lib/utils";

export const WatchPage = () => {
  const { id = "" } = useParams();
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { track } = useTracking(id);
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const videoQuery = useQuery({ queryKey: ["videos", "detail", id], queryFn: () => fetchVideoDetail(id), enabled: !!id });
  const commentsQuery = useQuery({ queryKey: ["videos", "comments", id], queryFn: () => fetchComments(id), enabled: !!id });
  const streamQuery = useQuery({ queryKey: ["videos", "stream", id], queryFn: () => fetchStreamUrl(id), enabled: !!id });
  const recommendationsQuery = useQuery({ queryKey: ["videos", "recommendations", id], queryFn: fetchRecommendations });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Unauthorized");
      return toggleLike(id, token);
    },
    onSuccess: () => {
      track("like_click");
      toast.success("Updated like");
      queryClient.invalidateQueries({ queryKey: ["videos", "detail", id] });
    },
    onError: () => toast.error("Không thể cập nhật lượt thích"),
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Unauthorized");
      return postComment(id, comment, token);
    },
    onSuccess: () => {
      track("comment_submit");
      toast.success("Comment posted");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["videos", "comments", id] });
    },
    onError: () => toast.error("Không thể gửi bình luận"),
  });

  if (videoQuery.isLoading) return <div className="space-y-3"><Skeleton className="h-64 w-full" /><Skeleton className="h-40 w-full" /></div>;
  if (videoQuery.isError || !videoQuery.data) {
    return <ErrorState title="Không thể tải video" description="Video không tồn tại, không công khai hoặc máy chủ chưa phản hồi." onRetry={() => void videoQuery.refetch()} />;
  }

  const requireSignIn = (action: () => void) => {
    if (isSignedIn) {
      action();
      return;
    }
    navigate(`/sign-in?redirect_url=${encodeURIComponent(`/watch/${id}`)}`);
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {streamQuery.isError ? (
            <ErrorState title="Không thể phát video" description="URL phát video hiện chưa khả dụng." onRetry={() => void streamQuery.refetch()} />
          ) : (
            <VideoPlayer video={videoQuery.data} streamUrl={streamQuery.data} />
          )}
          <Card>
            <CardHeader>
              <h1 className="text-xl font-semibold">{videoQuery.data.title}</h1>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{videoQuery.data.description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => requireSignIn(() => likeMutation.mutate())} disabled={likeMutation.isPending} type="button">
                  Thích ({formatCount(videoQuery.data.likeCount)})
                </Button>
                <span className="text-sm text-muted-foreground">{formatCount(videoQuery.data.viewCount)} lượt xem</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <aside className="space-y-3">
          <h2 className="text-lg font-semibold">Liên quan</h2>
          {recommendationsQuery.isLoading ? <Skeleton className="h-52" /> : null}
          {(recommendationsQuery.data ?? []).filter((video) => video._id !== id).slice(0, 3).map((video) => <VideoCard key={video._id} video={video} />)}
          {!recommendationsQuery.isLoading && !recommendationsQuery.isError && !(recommendationsQuery.data ?? []).filter((video) => video._id !== id).length ? (
            <p className="text-sm text-muted-foreground">Chưa có video liên quan.</p>
          ) : null}
        </aside>
      </section>
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Bình luận</h2></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Viết bình luận" />
          <Button type="button" onClick={() => requireSignIn(() => commentMutation.mutate())} disabled={!comment.trim() || commentMutation.isPending}>
            {commentMutation.isPending ? "Đang gửi..." : "Gửi"}
          </Button>
          {commentsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {commentsQuery.isError ? <ErrorState title="Không thể tải bình luận" description="Hãy thử tải lại danh sách bình luận." onRetry={() => void commentsQuery.refetch()} /> : null}
          {(commentsQuery.data?.data ?? []).map((c) => (
            <article key={c._id} className="rounded-md border p-3">
              <strong className="text-sm">{c.userId?.username ?? "User"}</strong>
              <p className="text-sm text-muted-foreground">{c.content}</p>
            </article>
          ))}
          {!commentsQuery.isLoading && !commentsQuery.isError && !commentsQuery.data?.data.length ? (
            <EmptyState title="Chưa có bình luận" description="Hãy là người đầu tiên chia sẻ ý kiến về video này." />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
