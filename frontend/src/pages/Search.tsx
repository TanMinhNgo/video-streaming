import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchSearch } from "@/api/videos";
import { VideoCard } from "@/components/video/VideoCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const { data = [], isLoading } = useQuery({ queryKey: ["search", q], queryFn: () => fetchSearch(q), enabled: !!q });
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <Input value={q} readOnly />
      <p className="text-sm text-muted-foreground">{data.length} results</p>
      {isLoading ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} className="h-56 w-full" />)}
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.map((v) => <VideoCard key={v._id} video={v} />)}</section>
      )}
    </main>
  );
};
