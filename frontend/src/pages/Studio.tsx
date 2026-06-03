import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const StudioPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);

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
            ["Total Videos", "24"],
            ["Total Views", "184K"],
            ["Total Likes", "9.2K"],
            ["Subscribers", "1.8K"],
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
            <p className="text-sm text-muted-foreground">Manage titles, tags, visibility, and performance.</p>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>Delete selected video</Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="analytics">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Analytics Snapshot</h2></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Retention, watch time, CTR and audience trend charts will render here.</p></CardContent>
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
