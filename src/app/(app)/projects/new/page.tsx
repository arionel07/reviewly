import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";
import { getClient, listClients } from "@/lib/clients/queries";

import { NewProjectForm } from "./new-project-form";

export const metadata: Metadata = {
  title: "New project — Reviewly",
};

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { organizationId } = await requireWorkspace();
  const [{ clientId: requestedClientId }, clients] = await Promise.all([
    searchParams,
    listClients(organizationId),
  ]);

  if (clients.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <PageHeader
          title="New project"
          description="Set up a project to start collecting feedback"
        />
        <EmptyState
          title="Create a client first"
          description="Projects belong to a client. Add a client before creating a project."
          action={<Button render={<Link href="/clients/new" />}>New client</Button>}
        />
      </div>
    );
  }

  // The clientId query param is untrusted input: validate its shape before
  // it ever reaches a database query (a non-UUID string would otherwise
  // throw at the query layer), and only use it to preselect the client if
  // it actually resolves to a client in this organization.
  let defaultClientId = "";
  if (requestedClientId && z.uuid().safeParse(requestedClientId).success) {
    const requestedClient = await getClient(requestedClientId, organizationId);
    if (requestedClient) {
      defaultClientId = requestedClient.id;
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="New project"
        description="Set up a project to start collecting feedback"
      />
      <NewProjectForm
        clients={clients.map((client) => ({ id: client.id, name: client.name }))}
        defaultClientId={defaultClientId}
      />
    </div>
  );
}
