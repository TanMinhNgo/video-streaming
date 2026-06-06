import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prefetchRoute } from "@/lib/routePrefetch";
import { formatCount } from "@/lib/utils";
import type { Video } from "../../types";

export const VideoCard = ({ video }: { video: Video }) => (
  <Link to={`/watch/${video._id}`} className="group block min-w-0" onMouseEnter={() => prefetchRoute("watch")} onFocus={() => prefetchRoute("watch")}>
    <Card className="overflow-hidden border-border/80 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
      {video.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" className="aspect-video w-full bg-muted object-cover" />
      ) : (
        <div className="grid aspect-video w-full place-items-center bg-muted text-muted-foreground"><Play className="size-8 fill-current" /></div>
      )}
      <CardContent className="space-y-2 p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold">{video.title}</h3>
        <p className="line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">{video.description || "Video chưa có mô tả."}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{formatCount(video.viewCount)} views</Badge>
          <span className="text-xs text-muted-foreground">{formatCount(video.likeCount)} likes</span>
        </div>
      </CardContent>
    </Card>
  </Link>
);
