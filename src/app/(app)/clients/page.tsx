import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Clients — Reviewly",
};

export default function ClientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Clients" description="Manage your clients" />
      <EmptyState
        title="No clients yet"
        description="Clients will appear here once they are added."
      />
    </div>
  );
}
