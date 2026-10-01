"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { changeFeedbackStatusAction } from "@/lib/feedback/actions";
import {
  getAvailableFeedbackTransitions,
  type FeedbackStatus,
} from "@/lib/feedback/status";

const TRANSITION_LABELS: Record<FeedbackStatus, string> = {
  open: "Reopen",
  in_progress: "Start progress",
  resolved: "Resolve",
  reopened: "Reopen",
};

export function FeedbackStatusActions({
  feedbackId,
  projectId,
  status,
}: {
  feedbackId: string;
  projectId: string;
  status: FeedbackStatus;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transitions = getAvailableFeedbackTransitions(status);

  if (transitions.length === 0) {
    return null;
  }

  const handleTransition = async (next: FeedbackStatus) => {
    setIsPending(true);
    setError(null);

    const result = await changeFeedbackStatusAction(feedbackId, projectId, {
      status: next,
    });

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    router.refresh();
    setIsPending(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {transitions.map((next) => (
          <Button
            key={next}
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleTransition(next)}
          >
            {TRANSITION_LABELS[next]}
          </Button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
