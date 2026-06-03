import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSearch } from "@/api/videos";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video/VideoCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const { data = [], isLoading } = useQuery({ queryKey: ["search", q], queryFn: () => fetchSearch(q), enabled: !!q });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = draft.trim();
    if (value) setParams({ q: value });
  };

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Try streaming, tags, studio" />
        <Button type="submit">Search</Button>
      </form>
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
