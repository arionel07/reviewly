import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { ProjectStatusBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";
import { getProject } from "@/lib/projects/queries";

export const metadata: Metadata = {
  title: "Project — Reviewly",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { organizationId } = await requireWorkspace();
  const project = await getProject(projectId, organizationId);

  // A project that doesn't exist and a project that belongs to another
  // workspace look identical here on purpose — getProject already scopes
  // the lookup by organizationId, so this never distinguishes "not
  // found" from "not yours."
  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title={project.name}
        description={project.clientName}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              render={
                <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              Open website
            </Button>
            <Button variant="outline" render={<Link href={`/projects/${project.id}/edit`} />}>
              Edit
            </Button>
            <DeleteProjectDialog projectId={project.id} projectName={project.name} />
          </div>
        }
      />

      <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
        <dt className="text-muted-foreground">Client</dt>
        <dd>
          <Link href={`/clients/${project.clientId}`} className="font-medium hover:underline">
            {project.clientName}
          </Link>
        </dd>
        <dt className="text-muted-foreground">Website</dt>
        <dd className="truncate">
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {project.websiteUrl}
          </a>
        </dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <ProjectStatusBadge status={project.status} />
        </dd>
      </dl>

      <p className="text-xs text-muted-foreground">
        Created {format(project.createdAt, "MMM d, yyyy")}
      </p>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-foreground">Feedback</h2>
        <EmptyState
          title="No feedback yet"
          description="Feedback collected from this project's website will appear here."
        />
      </div>
    </div>
  );
}
