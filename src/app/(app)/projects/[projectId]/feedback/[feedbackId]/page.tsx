import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { DeleteFeedbackDialog } from "@/components/feedback/delete-feedback-dialog";
import { FeedbackCommentForm } from "@/components/feedback/feedback-comment-form";
import { FeedbackStatusActions } from "@/components/feedback/feedback-status-actions";
import { FeedbackStatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth/session";
import { getFeedback, listFeedbackComments } from "@/lib/feedback/queries";

export const metadata: Metadata = {
  title: "Feedback — Reviewly",
};

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; feedbackId: string }>;
}) {
  const { projectId, feedbackId } = await params;
  const { organizationId } = await requireWorkspace();
  const item = await getFeedback(feedbackId, projectId, organizationId);

  // Feedback that doesn't exist, belongs to a different project, or
  // belongs to a different workspace all look identical here on purpose
  // — getFeedback already scopes the lookup, so none of those cases is
  // distinguishable from the others.
  if (!item) {
    notFound();
  }

  const comments = await listFeedbackComments(feedbackId, projectId, organizationId);

  const contextRows: { label: string; value: string }[] = [
    { label: "Page", value: item.pageUrl },
  ];
  if (item.selector) contextRows.push({ label: "Element selector", value: item.selector });
  if (item.viewportWidth && item.viewportHeight) {
    contextRows.push({
      label: "Viewport",
      value: `${item.viewportWidth} × ${item.viewportHeight}`,
    });
  }
  if (item.userAgent) contextRows.push({ label: "Browser", value: item.userAgent });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Feedback"
        description={item.authorName ?? item.authorEmail ?? undefined}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              render={<Link href={`/projects/${projectId}/feedback/${item.id}/edit`} />}
            >
              Edit
            </Button>
            <DeleteFeedbackDialog feedbackId={item.id} projectId={projectId} />
          </div>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FeedbackStatusBadge status={item.status} />
          <span className="text-xs text-muted-foreground">
            Reported {format(item.createdAt, "MMM d, yyyy")}
          </span>
        </div>
        <p className="max-w-lg text-sm whitespace-pre-wrap text-foreground">{item.message}</p>
        <FeedbackStatusActions feedbackId={item.id} projectId={projectId} status={item.status} />
      </div>

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

        <FeedbackCommentForm feedbackId={item.id} projectId={projectId} />
      </div>
    </div>
  );
}
