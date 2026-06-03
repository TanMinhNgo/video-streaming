import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchUserProfile } from "@/api/users";
import { Card, CardContent } from "@/components/ui/card";

export const ChannelPage = () => {
  const { id = "" } = useParams();
  const { data } = useQuery({ queryKey: ["user", id], queryFn: () => fetchUserProfile(id), enabled: !!id });
  return (
    <main className="space-y-4">
      <section className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-foreground text-lg font-semibold text-background">{(data?.username || "C").slice(0, 1).toUpperCase()}</div>
        <div>
          <h1 className="text-2xl font-semibold">{data?.username || "Channel"}</h1>
          <p className="text-sm text-muted-foreground">{data?.bio || "No bio yet"}</p>
          <span className="text-sm text-muted-foreground">{data?.subscriberCount ?? 0} subscribers</span>
        </div>
      </section>
      <Card><CardContent className="p-4 text-sm text-muted-foreground">No videos published yet.</CardContent></Card>
    </main>
  );
};
