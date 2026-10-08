import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectStatusBadge } from "@/components/projects/status-badge";
import { StatTile } from "@/components/review/stat-tile";
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
import { getDashboardOverview } from "@/lib/dashboard/queries";

export const metadata: Metadata = {
  title: "Dashboard — Reviewly",
};

export default async function DashboardPage() {
  const { user, organizationId } = await requireWorkspace();
  const overview = await getDashboardOverview(organizationId);
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here is your workspace overview.`}
        action={<Button render={<Link href="/projects/new" />}>Create project</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Projects" value={overview.projectCount} />
        <StatTile label="Clients" value={overview.clientCount} />
        <StatTile label="Feedback needing attention" value={overview.feedbackCount} />
        <StatTile label="Reviews in progress" value={overview.pendingReviewCount} />
      </div>

      {overview.projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start collecting client feedback."
          action={<Button render={<Link href="/projects/new" />}>Create project</Button>}
        />
      ) : (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">Recent projects</h2>
              <p className="text-sm text-muted-foreground">Your latest workspace activity.</p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/projects" />}>
              View all
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.clientName}</TableCell>
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
        </section>
      )}
    </div>
  );
}
