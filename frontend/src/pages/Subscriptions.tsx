import { VideoCard } from "@/components/video/VideoCard";
import { sampleVideos } from "@/lib/sampleData";

export const SubscriptionsPage = () => (
  <main className="space-y-4">
    <h1 className="text-2xl font-semibold">Subscriptions</h1>
    <p className="text-sm text-muted-foreground">Latest sample uploads from channels you follow.</p>
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sampleVideos.slice(0, 4).map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </section>
  </main>
);
