import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Resource not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been deleted or may not belong to this workspace.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
    </div>
  );
}
