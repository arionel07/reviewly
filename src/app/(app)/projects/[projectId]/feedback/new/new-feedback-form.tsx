"use client";

import { FeedbackForm } from "@/components/feedback/feedback-form";
import { createFeedbackAction } from "@/lib/feedback/actions";

export function NewFeedbackForm({ projectId }: { projectId: string }) {
  return (
    <FeedbackForm
      defaultValues={{ message: "", pageUrl: "", authorName: undefined, authorEmail: undefined }}
      onSubmit={(values) => createFeedbackAction(projectId, values)}
      submitLabel="Add feedback"
      pendingLabel="Adding feedback…"
      layout="dialog"
      cancelHref={`/projects/${projectId}/feedback`}
    />
  );
}
