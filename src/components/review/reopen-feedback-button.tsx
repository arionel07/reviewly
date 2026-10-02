"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { reopenFeedbackAction } from "@/lib/review/actions";

/**
 * The client's only status mutation (see the task's resolved→reopened
 * restriction) — rendered only when the server already determined
 * status === "resolved" (see the detail page), but the action itself
 * re-checks that too, so this button is never the only thing standing
 * between a client and an arbitrary status change.
 */
export function ReopenFeedbackButton({
  token,
  feedbackId,
}: {
  token: string;
  feedbackId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReopen = async () => {
    setIsPending(true);
    setError(null);

    const result = await reopenFeedbackAction(token, feedbackId);

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
      <Button type="button" variant="outline" disabled={isPending} onClick={handleReopen}>
        Not fixed — reopen
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
