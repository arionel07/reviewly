import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import { getFeedback } from "@/lib/feedback/queries";

import { EditFeedbackForm } from "./edit-feedback-form";

export const metadata: Metadata = {
  title: "Edit feedback — Reviewly",
};

export default async function EditFeedbackPage({
  params,
}: {
  params: Promise<{ projectId: string; feedbackId: string }>;
}) {
  const { projectId, feedbackId } = await params;
  const { organizationId } = await requireWorkspace();
  const item = await getFeedback(feedbackId, projectId, organizationId);

  if (!item) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Edit feedback" />
      <EditFeedbackForm
        feedbackId={item.id}
        projectId={projectId}
        defaultValues={{
          message: item.message,
          pageUrl: item.pageUrl,
          authorName: item.authorName ?? undefined,
          authorEmail: item.authorEmail ?? undefined,
        }}
      />
    </div>
  );
}
