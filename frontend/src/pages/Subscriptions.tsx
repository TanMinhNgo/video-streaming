import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const SubscriptionsPage = () => (
  <main className="space-y-4">
    <h1 className="text-2xl font-semibold">Subscriptions</h1>
    <Card>
      <CardHeader><p className="text-sm text-muted-foreground">Latest uploads from channels you follow will appear here.</p></CardHeader>
      <CardContent><div className="text-sm text-muted-foreground">No recent uploads yet.</div></CardContent>
    </Card>
  </main>
);
