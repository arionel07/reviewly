import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Profile — Reviewly",
};

export default async function ProfilePage() {
  const { user } = await requireWorkspace();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Profile" description="Your Reviewly account" />

      <section className="max-w-xl rounded-xl border border-border p-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{user.email}</p>
          </div>
          <div className="pt-2">
            <Button variant="outline" render={<Link href="/settings?tab=account" />}>
              Account settings
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
