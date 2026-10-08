import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RouteDialog } from "@/components/app-shell/route-dialog";
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
    <RouteDialog
      title="Add feedback"
      description={project.name}
      backHref={`/projects/${project.id}/feedback`}
    >
      <NewFeedbackForm projectId={project.id} />
    </RouteDialog>
  );
}
