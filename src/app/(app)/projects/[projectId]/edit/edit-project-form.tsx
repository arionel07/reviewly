"use client";

import { ProjectForm } from "@/components/projects/project-form";
import { updateProjectAction } from "@/lib/projects/actions";
import type { ProjectInput } from "@/lib/projects/schemas";

export function EditProjectForm({
  projectId,
  clients,
  defaultValues,
}: {
  projectId: string;
  clients: { id: string; name: string }[];
  defaultValues: ProjectInput;
}) {
  return (
    <ProjectForm
      clients={clients}
      defaultValues={defaultValues}
      showStatus
      onSubmit={(values) => updateProjectAction(projectId, values)}
      submitLabel="Save changes"
      pendingLabel="Saving…"
    />
  );
}
