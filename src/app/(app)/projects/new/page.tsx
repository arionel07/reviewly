import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "New project — Reviewly",
};

export default function NewProjectPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="New project" description="Set up a project to start collecting feedback" />
      <EmptyState
        title="Project creation is coming soon"
        description="This is a placeholder so links to this page don't break — creating a project isn't implemented yet."
      />
    </div>
  );
}
