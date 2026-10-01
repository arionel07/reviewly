import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { FeedbackStatusBadge } from "@/components/feedback/status-badge";
import { FeedbackStatusFilter } from "@/components/feedback/status-filter";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";
import { feedbackStatusValues, type FeedbackStatus } from "@/lib/feedback/status";
import { listFeedbackForProject } from "@/lib/feedback/queries";
import { getProject } from "@/lib/projects/queries";

export const metadata: Metadata = {
  title: "Feedback — Reviewly",
};

function parseStatus(value: string | undefined): FeedbackStatus | undefined {
  return feedbackStatusValues.find((status) => status === value);
}

export default async function ProjectFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { projectId } = await params;
  const { organizationId } = await requireWorkspace();
  const project = await getProject(projectId, organizationId);

  if (!project) {
    notFound();
  }

  // The status query param is untrusted input: only ever used if it
  // exactly matches a real status value, never passed through as-is.
  const { status: requestedStatus } = await searchParams;
  const activeStatus = parseStatus(requestedStatus);

  const feedbackItems = await listFeedbackForProject(
    project.id,
    organizationId,
    activeStatus,
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Feedback"
        description={project.name}
        action={
          <Button render={<Link href={`/projects/${project.id}/feedback/new`} />}>
            Add feedback
          </Button>
        }
      />

      <FeedbackStatusFilter projectId={project.id} activeStatus={activeStatus} />

      {feedbackItems.length === 0 ? (
        <EmptyState
          title="No feedback yet"
          description="Feedback collected from this project's website will appear here."
          action={
            <Button render={<Link href={`/projects/${project.id}/feedback/new`} />}>
              Add feedback
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {feedbackItems.map((item) => (
            <li key={item.id}>
              <Link
                href={`/projects/${project.id}/feedback/${item.id}`}
                className="flex flex-col gap-1 rounded-xl border border-border px-4 py-3 hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">
                    {item.message}
                  </p>
                  <FeedbackStatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.authorName ? <span>{item.authorName}</span> : null}
                  <span className="truncate">{item.pageUrl}</span>
                  <span className="shrink-0">{format(item.createdAt, "MMM d, yyyy")}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
