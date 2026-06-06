import { AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type FeedbackProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: FeedbackProps) {
  return (
    <section className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-card/60 px-6 py-10 text-center">
      <Inbox className="mb-4 size-8 text-muted-foreground" strokeWidth={1.5} />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

export function ErrorState({ title, description, onRetry }: FeedbackProps & { onRetry?: () => void }) {
  return (
    <section className="flex min-h-56 flex-col items-center justify-center rounded-xl border bg-card px-6 py-10 text-center">
      <AlertCircle className="mb-4 size-8 text-muted-foreground" strokeWidth={1.5} />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {onRetry ? <Button className="mt-5" variant="secondary" onClick={onRetry}>Thử lại</Button> : null}
    </section>
  );
}
