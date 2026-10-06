import type { Metadata } from "next";
import Link from "next/link";

import { ReviewLinkUnavailable } from "@/components/review/review-link-unavailable";
import { ProjectReviewDecision } from "@/components/review/project-review-decision";
import { StatTile } from "@/components/review/stat-tile";
import { FeedbackStatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/ui/button";
import { listFeedbackForProjectUnchecked } from "@/lib/feedback/queries";
import {
  findProjectByReviewToken,
  getLatestProjectReviewForAuthorizedProject,
} from "@/lib/review/queries";

const RECENT_FEEDBACK_LIMIT = 5;

export const metadata: Metadata = {
  title: "Review — Reviewly",
};

export default async function ReviewProjectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = await findProjectByReviewToken(token);

  if (!project) {
    return <ReviewLinkUnavailable />;
  }

  const [feedbackItems, latestReview] = await Promise.all([
    listFeedbackForProjectUnchecked(project.id),
    getLatestProjectReviewForAuthorizedProject(project.id),
  ]);
  const recentFeedback = feedbackItems.slice(0, RECENT_FEEDBACK_LIMIT);

  const counts = {
    open: feedbackItems.filter((item) => item.status === "open").length,
    in_progress: feedbackItems.filter((item) => item.status === "in_progress").length,
    resolved: feedbackItems.filter((item) => item.status === "resolved").length,
    reopened: feedbackItems.filter((item) => item.status === "reopened").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
        <Button
          variant="outline"
          className="w-fit"
          render={<a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" />}
        >
          Open website
        </Button>
      </div>

      {latestReview ? (
        <ProjectReviewDecision
          token={token}
          status={latestReview.status}
          decidedAt={latestReview.decidedAt}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Open" value={counts.open} />
        <StatTile label="In progress" value={counts.in_progress} />
        <StatTile label="Resolved" value={counts.resolved} />
        <StatTile label="Reopened" value={counts.reopened} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Feedback</h2>
          {feedbackItems.length > 0 ? (
            <Button variant="outline" size="sm" render={<Link href={`/r/${token}/feedback`} />}>
              View all
            </Button>
          ) : null}
        </div>

        {recentFeedback.length === 0 ? (
          <p className="text-sm text-muted-foreground">No feedback yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {recentFeedback.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/r/${token}/feedback/${item.id}`}
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
