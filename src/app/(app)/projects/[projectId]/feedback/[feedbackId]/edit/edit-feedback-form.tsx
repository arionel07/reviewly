"use client";

import { FeedbackForm } from "@/components/feedback/feedback-form";
import { updateFeedbackAction } from "@/lib/feedback/actions";
import type { FeedbackInput } from "@/lib/feedback/schemas";

export function EditFeedbackForm({
  feedbackId,
  projectId,
  defaultValues,
}: {
  feedbackId: string;
  projectId: string;
  defaultValues: FeedbackInput;
}) {
  return (
    <FeedbackForm
      defaultValues={defaultValues}
      onSubmit={(values) => updateFeedbackAction(feedbackId, projectId, values)}
      submitLabel="Save changes"
      pendingLabel="Saving…"
    />
  );
}
