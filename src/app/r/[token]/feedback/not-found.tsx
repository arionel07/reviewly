import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ReviewFeedbackNotFound() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Feedback not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This feedback item does not belong to the current review project.
        </p>
      </div>
      <Button render={<Link href=".." />}>Back to feedback</Button>
    </div>
  );
}
