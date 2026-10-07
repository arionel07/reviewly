import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">The page you requested does not exist.</p>
      </div>
      <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
    </main>
  );
}
