import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const HistoryPage = () => (
  <main className="space-y-4">
    <h1 className="text-2xl font-semibold">Watch History</h1>
    <Card>
      <CardHeader><p className="text-sm text-muted-foreground">Your recently watched videos appear here.</p></CardHeader>
      <CardContent><div className="text-sm text-muted-foreground">No watch history in this session.</div></CardContent>
    </Card>
  </main>
);
