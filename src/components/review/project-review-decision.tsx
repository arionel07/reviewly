"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  approveProjectReviewAction,
  requestProjectChangesAction,
} from "@/lib/review/actions";

type Decision = "approve" | "changes";

export function ProjectReviewDecision({
  token,
  status,
  decidedAt,
}: {
  token: string;
  status: "pending" | "changes_requested" | "approved";
  decidedAt: Date | null;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "pending") {
    return (
      <section className="rounded-xl border border-border bg-muted/30 p-4">
        <h2 className="text-base font-semibold text-foreground">
          {status === "approved" ? "Approved" : "Changes requested"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {status === "approved"
            ? `Approved on ${decidedAt ? format(decidedAt, "MMM d, yyyy") : "an earlier date"}.`
            : `Changes were requested on ${decidedAt ? format(decidedAt, "MMM d, yyyy") : "an earlier date"}.`}
        </p>
      </section>
    );
  }

  const isApprove = decision === "approve";

  const handleDecision = () => {
    if (!decision) return;

    setError(null);
    startTransition(async () => {
      const result = isApprove
        ? await approveProjectReviewAction(token)
        : await requestProjectChangesAction(token);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setDecision(null);
      router.refresh();
    });
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Ready for review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The agency has marked this project as ready for your review.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setDecision("changes")}>
          Request changes
        </Button>
        <Button type="button" onClick={() => setDecision("approve")}>
          Approve project
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Dialog open={decision !== null} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isApprove ? "Approve project?" : "Request changes?"}</DialogTitle>
            <DialogDescription>
              {isApprove
                ? "You're confirming that this version is accepted."
                : "You can reopen specific feedback items or leave comments describing what still needs work."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              Cancel
            </DialogClose>
            <Button onClick={handleDecision} disabled={isPending}>
              {isPending ? "Saving…" : isApprove ? "Approve" : "Request changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
