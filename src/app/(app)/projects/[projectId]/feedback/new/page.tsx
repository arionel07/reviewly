import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import { getProject } from "@/lib/projects/queries";

import { NewFeedbackForm } from "./new-feedback-form";

export const metadata: Metadata = {
  title: "Add feedback — Reviewly",
};

export default async function NewFeedbackPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { organizationId } = await requireWorkspace();
  const project = await getProject(projectId, organizationId);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Add feedback" description={project.name} />
      <NewFeedbackForm projectId={project.id} />
    </div>
  );
}
