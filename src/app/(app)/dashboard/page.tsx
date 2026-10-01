import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { requireWorkspace } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard — Reviewly",
};

export default async function DashboardPage() {
  const { user } = await requireWorkspace();
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Dashboard" description="Overview of your workspace" />
      <EmptyState
        title={`Welcome back, ${firstName}`}
        description="No projects yet. Create your first project to start collecting client feedback."
        action={
          <Button render={<Link href="/projects/new" />}>Create project</Button>
        }
      />
    </div>
  );
}
