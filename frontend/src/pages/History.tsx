import { VideoCard } from "@/components/video/VideoCard";
import { sampleVideos } from "@/lib/sampleData";

export const HistoryPage = () => (
  <main className="space-y-4">
    <h1 className="text-2xl font-semibold">Watch History</h1>
    <p className="text-sm text-muted-foreground">Sample session history for validating watch pages and playback tracking.</p>
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sampleVideos.slice(1, 5).map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </section>
  </main>
);
