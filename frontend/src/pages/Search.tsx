import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSearch } from "@/api/videos";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { VideoCard } from "@/components/video/VideoCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["search", q], queryFn: () => fetchSearch(q), enabled: !!q });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = draft.trim();
    if (value) setParams({ q: value });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tìm kiếm</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Tên video, mô tả hoặc tag" />
        <Button type="submit" className="sm:w-auto">Tìm kiếm</Button>
      </form>
      {q ? <p className="text-sm text-muted-foreground">{data.length} kết quả cho “{q}”</p> : null}
      {isLoading ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} className="h-56 w-full" />)}
        </section>
      ) : isError ? (
        <ErrorState title="Không thể tìm kiếm" description="Đã có lỗi khi kết nối tới máy chủ." onRetry={() => void refetch()} />
      ) : !q ? (
        <EmptyState title="Nhập nội dung cần tìm" description="Bạn có thể tìm theo tiêu đề, mô tả hoặc tag của video." />
      ) : data.length === 0 ? (
        <EmptyState title="Không tìm thấy video" description="Thử từ khóa ngắn hơn hoặc dùng một tag khác." />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.map((v) => <VideoCard key={v._id} video={v} />)}</section>
      )}
    </div>
  );
};
