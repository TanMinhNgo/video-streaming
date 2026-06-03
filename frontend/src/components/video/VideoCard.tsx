import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prefetchRoute } from "@/lib/routePrefetch";
import type { Video } from "../../types";

export const VideoCard = ({ video }: { video: Video }) => (
  <Link to={`/watch/${video._id}`} className="group" onMouseEnter={() => prefetchRoute("watch")} onFocus={() => prefetchRoute("watch")}>
    <Card className="overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-md">
      <img src={video.thumbnailUrl || video.imageKitUrl} alt={video.title} className="aspect-video w-full object-cover" />
      <CardContent className="space-y-2 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{video.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{video.description || "No description"}</p>
        <Badge>{video.viewCount.toLocaleString()} views</Badge>
      </CardContent>
    </Card>
  </Link>
);
