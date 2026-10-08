import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectStatusBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireWorkspace } from "@/lib/auth/session";
import { listProjects } from "@/lib/projects/queries";

export const metadata: Metadata = {
  title: "Projects — Reviewly",
};

export default async function ProjectsPage() {
  const { organizationId } = await requireWorkspace();
  const projects = await listProjects(organizationId);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Projects"
        description="Manage client projects and review websites."
        action={<Button render={<Link href="/projects/new" />}>New project</Button>}
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start collecting website feedback."
          action={<Button render={<Link href="/projects/new" />}>New project</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`/clients/${project.clientId}`} className="hover:underline">
                      {project.clientName}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    {project.websiteUrl}
                  </TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(project.updatedAt, "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
