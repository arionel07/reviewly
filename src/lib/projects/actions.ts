"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireWorkspace } from "@/lib/auth/session";
import { getClient } from "@/lib/clients/queries";
import { generateProjectPublicKey } from "@/lib/projects/public-key";
import { createProject, deleteProject, updateProject } from "@/lib/projects/queries";
import { projectSchema } from "@/lib/projects/schemas";

type ProjectActionResult = { error: string };

/**
 * A client id arriving in a project mutation is never trusted just
 * because it parses as a UUID — it must actually belong to the caller's
 * own organization, verified the same way a direct client lookup is:
 * reusing the tenant-scoped getClient query rather than a second,
 * divergent check.
 */
async function assertClientInWorkspace(clientId: string, organizationId: string) {
  const client = await getClient(clientId, organizationId);
  return client !== null;
}

export async function createProjectAction(
  input: unknown,
): Promise<ProjectActionResult> {
  const { organizationId } = await requireWorkspace();
  const parsed = projectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter valid project details.",
    };
  }

  const clientInWorkspace = await assertClientInWorkspace(
    parsed.data.clientId,
    organizationId,
  );

  if (!clientInWorkspace) {
    return { error: "Select a client from your workspace." };
  }

  const created = await createProject(organizationId, {
    ...parsed.data,
    publicKey: generateProjectPublicKey(),
  });

  revalidatePath("/projects");
  revalidatePath(`/clients/${parsed.data.clientId}`);
  redirect(`/projects/${created.id}`);
}

export async function updateProjectAction(
  projectId: string,
  input: unknown,
): Promise<ProjectActionResult> {
  // organizationId always comes from the caller's own session, never from
  // the form — this is what stops a workspace B user from editing
  // workspace A's project, even when submitting workspace A's project id.
  const { organizationId } = await requireWorkspace();
  const parsed = projectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter valid project details.",
    };
  }

  const clientInWorkspace = await assertClientInWorkspace(
    parsed.data.clientId,
    organizationId,
  );

  if (!clientInWorkspace) {
    return { error: "Select a client from your workspace." };
  }

  const updated = await updateProject(projectId, organizationId, parsed.data);

  if (!updated) {
    return { error: "This project could not be found." };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${parsed.data.clientId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteProjectAction(
  projectId: string,
): Promise<ProjectActionResult> {
  const { organizationId } = await requireWorkspace();
  const deleted = await deleteProject(projectId, organizationId);

  if (!deleted) {
    return { error: "This project could not be found." };
  }

  revalidatePath("/projects");
  revalidatePath(`/clients/${deleted.clientId}`);
  redirect("/projects");
}
