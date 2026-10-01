import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Projects — Reviewly",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Projects" description="Manage client projects" />
      <EmptyState
        title="No projects yet"
        description="Projects you create will appear here."
        action={
          <Button render={<Link href="/projects/new" />}>New project</Button>
        }
      />
    </div>
  );
}
