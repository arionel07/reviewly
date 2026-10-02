import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientCommentForm } from "@/components/review/client-comment-form";
import { ReopenFeedbackButton } from "@/components/review/reopen-feedback-button";
import { ReviewLinkUnavailable } from "@/components/review/review-link-unavailable";
import { ScreenshotPreview } from "@/components/feedback/screenshot-preview";
import { FeedbackStatusBadge } from "@/components/feedback/status-badge";
import { getFeedbackInProject, listFeedbackCommentsUnchecked } from "@/lib/feedback/queries";
import { findProjectByReviewToken, getReviewFeedbackScreenshotUrl } from "@/lib/review/queries";

export const metadata: Metadata = {
  title: "Feedback — Reviewly",
};

export default async function ReviewFeedbackDetailPage({
  params,
}: {
  params: Promise<{ token: string; feedbackId: string }>;
}) {
  const { token, feedbackId } = await params;
  const project = await findProjectByReviewToken(token);

  if (!project) {
    return <ReviewLinkUnavailable />;
  }

  const item = await getFeedbackInProject(feedbackId, project.id);

  // feedbackId is never trusted on its own — only a valid token's own
  // project, re-confirmed here. A feedbackId from a different project
  // is indistinguishable from one that doesn't exist at all.
  if (!item) {
    notFound();
  }

  const [comments, screenshotUrl] = await Promise.all([
    listFeedbackCommentsUnchecked(feedbackId),
    getReviewFeedbackScreenshotUrl(feedbackId, project.id),
  ]);

  const contextRows: { label: string; value: string }[] = [{ label: "Page", value: item.pageUrl }];
  if (item.elementText) contextRows.push({ label: "Element", value: item.elementText });
  if (item.viewportWidth && item.viewportHeight) {
    contextRows.push({
      label: "Viewport",
      value: `${item.viewportWidth} × ${item.viewportHeight}`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/r/${token}/feedback`} className="text-sm text-muted-foreground hover:underline">
        ← Feedback
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FeedbackStatusBadge status={item.status} />
          <span className="text-xs text-muted-foreground">
            Reported {format(item.createdAt, "MMM d, yyyy")}
          </span>
        </div>
        <p className="max-w-lg text-sm whitespace-pre-wrap text-foreground">{item.message}</p>
        {item.status === "resolved" ? (
          <ReopenFeedbackButton token={token} feedbackId={item.id} />
        ) : null}
      </div>

      {screenshotUrl ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-foreground">Screenshot</h2>
          <ScreenshotPreview url={screenshotUrl} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-foreground">Context</h2>
        <dl className="grid max-w-lg grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {contextRows.map((row) => (
            <div key={row.label} className="col-span-2 grid grid-cols-[auto_1fr] gap-x-6">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="truncate">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex max-w-lg flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">Comments</h2>

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-xl border border-border px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-foreground">
                    {comment.authorUserName ?? comment.authorName ?? "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(comment.createdAt, "MMM d, yyyy")}
                  </span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        <ClientCommentForm token={token} feedbackId={item.id} />
      </div>
    </div>
  );
}
