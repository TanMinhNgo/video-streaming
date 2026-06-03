import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sampleVideos } from "@/lib/sampleData";
import { formatCount } from "@/lib/utils";

export const StudioPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const totalViews = sampleVideos.reduce((sum, video) => sum + video.viewCount, 0);
  const totalLikes = sampleVideos.reduce((sum, video) => sum + video.likeCount, 0);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Studio Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Videos", String(sampleVideos.length)],
            ["Total Views", formatCount(totalViews)],
            ["Total Likes", formatCount(totalLikes)],
            ["Subscribers", "27.6K"],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader><h3 className="text-sm text-muted-foreground">{label}</h3></CardHeader>
              <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
            </Card>
          ))}
        </section>
        </TabsContent>

        <TabsContent value="videos">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Recent Uploads</h2></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {sampleVideos.slice(0, 4).map((video) => (
                <div key={video._id} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <h3 className="text-sm font-medium">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">{formatCount(video.viewCount)} views | {video.tags.join(", ")}</p>
                  </div>
                  <Button variant="secondary" type="button">Edit</Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>Delete selected video</Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="analytics">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Analytics Snapshot</h2></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              ["Avg watch", "3m 42s"],
              ["Completion", "64%"],
              ["Search traffic", "38%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border p-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <strong className="text-xl">{value}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete video?</DialogTitle>
            <DialogDescription>This action marks the video as deleted and removes file from ImageKit.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <DialogClose asChild><Button>Confirm delete</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
