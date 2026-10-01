import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import { listClients } from "@/lib/clients/queries";
import { getProject } from "@/lib/projects/queries";

import { EditProjectForm } from "./edit-project-form";

export const metadata: Metadata = {
  title: "Edit project — Reviewly",
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { organizationId } = await requireWorkspace();

  const [project, clients] = await Promise.all([
    getProject(projectId, organizationId),
    listClients(organizationId),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Edit project" description={project.name} />
      <EditProjectForm
        projectId={project.id}
        clients={clients.map((client) => ({ id: client.id, name: client.name }))}
        defaultValues={{
          name: project.name,
          clientId: project.clientId,
          websiteUrl: project.websiteUrl,
          status: project.status,
        }}
      />
    </div>
  );
}
