import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { ProjectStatusBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";
import { getClient } from "@/lib/clients/queries";
import { listProjectsForClient } from "@/lib/projects/queries";

export const metadata: Metadata = {
  title: "Client — Reviewly",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const { organizationId } = await requireWorkspace();
  const client = await getClient(clientId, organizationId);

  // A client that doesn't exist and a client that belongs to another
  // workspace look identical here on purpose — getClient already scopes
  // the lookup by organizationId, so this never distinguishes "not found"
  // from "not yours."
  if (!client) {
    notFound();
  }

  const projects = await listProjectsForClient(client.id, organizationId);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={client.name}
        description={client.email ?? "No email on file"}
        action={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/clients/${client.id}/edit`} />}>
              Edit
            </Button>
            <DeleteClientDialog clientId={client.id} clientName={client.name} />
          </div>
        }
      />

      <p className="text-xs text-muted-foreground">
        Added {format(client.createdAt, "MMM d, yyyy")}
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Projects</h2>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/projects/new?clientId=${client.id}`} />}
          >
            New project
          </Button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Projects for this client will appear here."
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="font-medium text-foreground">{project.name}</span>
                  <ProjectStatusBadge status={project.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
