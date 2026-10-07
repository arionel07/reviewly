"use client";

import { Button } from "@/components/ui/button";

export default function ReviewError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Review unavailable</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This review could not be loaded. Try again in a moment.
        </p>
      </div>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
