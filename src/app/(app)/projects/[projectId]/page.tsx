import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { FeedbackStatusBadge } from "@/components/feedback/status-badge";
import { CopySnippetButton } from "@/components/projects/copy-snippet-button";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { ProjectReviewSection } from "@/components/projects/project-review-section";
import { ReviewLinkSection } from "@/components/projects/review-link-section";
import { ProjectStatusBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";
import { listFeedbackForProject } from "@/lib/feedback/queries";
import { getProject } from "@/lib/projects/queries";
import {
  getLatestProjectReview,
  getProjectReviewReadiness,
  hasActiveReviewToken,
  listProjectReviews,
} from "@/lib/review/queries";
import { getAppBaseUrl } from "@/lib/widget/app-url";

const RECENT_FEEDBACK_LIMIT = 5;

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

  const feedbackItems = await listFeedbackForProject(project.id, organizationId);
  const recentFeedback = feedbackItems.slice(0, RECENT_FEEDBACK_LIMIT);
  const [initialHasActiveLink, latestReview, reviewHistory, reviewReadiness] = await Promise.all([
    hasActiveReviewToken(project.id, organizationId),
    getLatestProjectReview(project.id, organizationId),
    listProjectReviews(project.id, organizationId),
    getProjectReviewReadiness(project.id, organizationId),
  ]);

  const appBaseUrl = await getAppBaseUrl();
  const installSnippet = `<script\n  src="${appBaseUrl}/widget/widget.js"\n  data-project-key="${project.publicKey}"\n></script>`;

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

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-foreground">Installation</h2>
        <p className="max-w-lg text-sm text-muted-foreground">
          Add this snippet before the closing{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"</body>"}</code> tag on{" "}
          {project.websiteUrl} to collect feedback
          {project.status === "active"
            ? "."
            : " (the project must be Active for the widget to accept submissions)."}
        </p>
        <div className="max-w-lg rounded-lg border border-border bg-muted/50">
          <pre className="overflow-x-auto p-3 text-xs">
            <code>{installSnippet}</code>
          </pre>
        </div>
        <div>
          <CopySnippetButton text={installSnippet} />
        </div>
      </div>

      <ProjectReviewSection
        projectId={project.id}
        latestReview={latestReview}
        reviewHistory={reviewHistory}
        blockingCount={reviewReadiness?.blockingCount ?? 0}
        hasActiveReviewLink={initialHasActiveLink}
      />

      <ReviewLinkSection projectId={project.id} initialHasActiveLink={initialHasActiveLink} />

      <p className="text-xs text-muted-foreground">
        Created {format(project.createdAt, "MMM d, yyyy")}
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Feedback</h2>
          <div className="flex gap-2">
            {feedbackItems.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/projects/${project.id}/feedback`} />}
              >
                View all
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/projects/${project.id}/feedback/new`} />}
            >
              Add feedback
            </Button>
          </div>
        </div>

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
          <ul className="flex flex-col gap-1">
            {recentFeedback.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/projects/${project.id}/feedback/${item.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="line-clamp-1 font-medium text-foreground">{item.message}</span>
                  <FeedbackStatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
