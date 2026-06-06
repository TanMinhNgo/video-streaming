import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Eye, Heart, Video as VideoIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { fetchDashboard } from "@/api/analytics";
import { deleteVideo, fetchMyVideos } from "@/api/videos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCount } from "@/lib/utils";

export const StudioPage = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dashboardQuery = useQuery({ queryKey: ["analytics", "dashboard"], queryFn: fetchDashboard });
  const videosQuery = useQuery({ queryKey: ["videos", "mine"], queryFn: fetchMyVideos });
  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: async () => {
      toast.success("Đã xóa video");
      setDeleteId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["videos", "mine"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["videos", "list"] }),
      ]);
    },
    onError: () => toast.error("Không thể xóa video"),
  });

  const stats = dashboardQuery.data;
  const metricCards = [
    { label: "Video", value: stats?.videos ?? 0, icon: VideoIcon },
    { label: "Lượt xem", value: stats?.views ?? 0, icon: Eye },
    { label: "Lượt thích", value: stats?.likes ?? 0, icon: Heart },
    { label: "Sự kiện", value: stats?.events ?? 0, icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Theo dõi hiệu suất và quản lý video đã tải lên.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full overflow-x-auto sm:w-fit">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="videos">Video</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {dashboardQuery.isLoading ? (
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28" />)}</section>
          ) : dashboardQuery.isError ? (
            <ErrorState title="Không thể tải thống kê" description="Dữ liệu Studio hiện chưa khả dụng." onRetry={() => void dashboardQuery.refetch()} />
          ) : (
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-sm text-muted-foreground">{label}</h2>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent><p className="text-2xl font-bold tabular-nums">{formatCount(value)}</p></CardContent>
                </Card>
              ))}
            </section>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {videosQuery.isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : videosQuery.isError ? (
            <ErrorState title="Không thể tải video" description="Danh sách video của bạn hiện chưa khả dụng." onRetry={() => void videosQuery.refetch()} />
          ) : videosQuery.data?.length ? (
            <Card>
              <CardHeader><h2 className="text-lg font-semibold">Video của bạn</h2></CardHeader>
              <CardContent className="space-y-2">
                {videosQuery.data.map((video) => (
                  <article key={video._id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center">
                    <img src={video.thumbnailUrl || video.imageKitUrl} alt="" className="aspect-video w-full rounded-md object-cover sm:w-28" />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">{video.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{formatCount(video.viewCount)} lượt xem · {formatCount(video.likeCount)} lượt thích · {video.visibility}</p>
                    </div>
                    <Button variant="ghost" type="button" onClick={() => setDeleteId(video._id)}>Xóa</Button>
                  </article>
                ))}
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="Bạn chưa tải video" description="Video tải lên thành công sẽ xuất hiện trong danh sách quản lý." />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa video?</DialogTitle>
            <DialogDescription>Video sẽ bị xóa khỏi StreamBox và file tương ứng trên ImageKit. Thao tác này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 flex-col-reverse sm:flex-row">
            <DialogClose asChild><Button variant="ghost">Hủy</Button></DialogClose>
            <Button
              disabled={!deleteId || deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
