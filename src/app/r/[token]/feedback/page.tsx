import type { Metadata } from "next";
import Link from "next/link";

import { ReviewLinkUnavailable } from "@/components/review/review-link-unavailable";
import { ReviewStatusFilter } from "@/components/review/review-status-filter";
import { FeedbackStatusBadge } from "@/components/feedback/status-badge";
import { listFeedbackForProjectUnchecked } from "@/lib/feedback/queries";
import { feedbackStatusValues, type FeedbackStatus } from "@/lib/feedback/status";
import { findProjectByReviewToken } from "@/lib/review/queries";

export const metadata: Metadata = {
  title: "Feedback — Reviewly",
};

function parseStatus(value: string | undefined): FeedbackStatus | undefined {
  return feedbackStatusValues.find((status) => status === value);
}

export default async function ReviewFeedbackListPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { token } = await params;
  const project = await findProjectByReviewToken(token);

  if (!project) {
    return <ReviewLinkUnavailable />;
  }

  // Untrusted input: only ever used if it exactly matches a real status
  // value, never passed through to the query as-is.
  const { status: requestedStatus } = await searchParams;
  const activeStatus = parseStatus(requestedStatus);

  const feedbackItems = await listFeedbackForProjectUnchecked(project.id, activeStatus);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href={`/r/${token}`} className="text-sm text-muted-foreground hover:underline">
          ← {project.name}
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Feedback</h1>
      </div>

      <ReviewStatusFilter token={token} activeStatus={activeStatus} />

      {feedbackItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">No feedback here yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {feedbackItems.map((item) => (
            <li key={item.id}>
              <Link
                href={`/r/${token}/feedback/${item.id}`}
                className="flex flex-col gap-1 rounded-2xl bg-card px-5 py-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">
                    {item.message}
                  </p>
                  <FeedbackStatusBadge status={item.status} />
                </div>
                <span className="truncate text-xs text-muted-foreground">{item.pageUrl}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
