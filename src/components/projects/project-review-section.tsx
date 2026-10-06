"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { requestProjectReviewAction } from "@/lib/review/actions";
import type { ProjectReview } from "@/lib/review/queries";
import { getProjectReviewStatusLabel } from "@/lib/review/project-review";

export function ProjectReviewSection({
  projectId,
  latestReview,
  reviewHistory,
  blockingCount,
  hasActiveReviewLink,
}: {
  projectId: string;
  latestReview: ProjectReview | null;
  reviewHistory: ProjectReview[];
  blockingCount: number;
  hasActiveReviewLink: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const canRequestReview = latestReview?.status !== "pending";
  const isReady = blockingCount === 0;

  const handleRequestReview = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestProjectReviewAction(projectId);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-foreground">Review</h2>

      {!latestReview ? (
        <>
          <p className="max-w-lg text-sm text-muted-foreground">
            Resolve all feedback before requesting client approval.
          </p>
          <Button
            type="button"
            className="w-fit"
            size="sm"
            disabled={!isReady || isPending}
            onClick={handleRequestReview}
          >
            {isPending ? "Requesting…" : "Request review"}
          </Button>
        </>
      ) : latestReview.status === "pending" ? (
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium text-foreground">In review</p>
          <p className="text-muted-foreground">Waiting for the client decision.</p>
          <p className="text-xs text-muted-foreground">
            Requested: {format(latestReview.requestedAt, "MMM d, yyyy")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <div>
            <p className="font-medium text-foreground">
              {getProjectReviewStatusLabel(latestReview.status)}
            </p>
            <p className="text-xs text-muted-foreground">
              Decided: {format(latestReview.decidedAt ?? latestReview.updatedAt, "MMM d, yyyy")}
            </p>
          </div>
          <Button
            type="button"
            className="w-fit"
            size="sm"
            disabled={!canRequestReview || !isReady || isPending}
            onClick={handleRequestReview}
          >
            {isPending ? "Requesting…" : "Request review again"}
          </Button>
        </div>
      )}

      {blockingCount > 0 && latestReview?.status !== "pending" ? (
        <p className="text-sm text-muted-foreground">
          {blockingCount} feedback {blockingCount === 1 ? "item still needs" : "items still need"} attention.
        </p>
      ) : null}

      {!hasActiveReviewLink ? (
        <p className="max-w-lg text-xs text-muted-foreground">
          No active review link is available. Requesting review does not create a link; create one
          in the Review link section so the client can access this project.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {reviewHistory.length > 0 ? (
        <div className="flex flex-col gap-2 pt-2">
          <h3 className="text-sm font-medium text-foreground">Review history</h3>
          <ol className="flex flex-col gap-2">
            {reviewHistory.map((review, index) => (
              <li key={review.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                <p className="font-medium text-foreground">
                  Round {reviewHistory.length - index} · {getProjectReviewStatusLabel(review.status)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested {format(review.requestedAt, "MMM d, yyyy")}
                  {review.decidedAt
                    ? ` · Decided ${format(review.decidedAt, "MMM d, yyyy")}`
                    : ""}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
