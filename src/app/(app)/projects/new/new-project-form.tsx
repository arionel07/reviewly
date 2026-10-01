"use client";

import { ProjectForm } from "@/components/projects/project-form";
import { createProjectAction } from "@/lib/projects/actions";

export function NewProjectForm({
  clients,
  defaultClientId,
}: {
  clients: { id: string; name: string }[];
  defaultClientId: string;
}) {
  return (
    <ProjectForm
      clients={clients}
      defaultValues={{
        name: "",
        clientId: defaultClientId,
        websiteUrl: "",
        status: "draft",
      }}
      onSubmit={(values) => createProjectAction(values)}
      submitLabel="Create project"
      pendingLabel="Creating project…"
    />
  );
}
