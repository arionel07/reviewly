"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireWorkspace } from "@/lib/auth/session";
import { createClient, deleteClient, updateClient } from "@/lib/clients/queries";
import { clientSchema } from "@/lib/clients/schemas";

type ClientActionResult = { error: string };

export async function createClientAction(
  input: unknown,
): Promise<ClientActionResult> {
  const { organizationId } = await requireWorkspace();
  const parsed = clientSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid client." };
  }

  const created = await createClient(organizationId, parsed.data);

  revalidatePath("/clients");
  redirect(`/clients/${created.id}`);
}

export async function updateClientAction(
  clientId: string,
  input: unknown,
): Promise<ClientActionResult> {
  // organizationId always comes from the caller's own session, never from
  // the form — this is what stops a workspace B user from editing
  // workspace A's client, even when submitting workspace A's client id.
  const { organizationId } = await requireWorkspace();
  const parsed = clientSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid client." };
  }

  const updated = await updateClient(clientId, organizationId, parsed.data);

  if (!updated) {
    return { error: "This client could not be found." };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deleteClientAction(
  clientId: string,
): Promise<ClientActionResult> {
  const { organizationId } = await requireWorkspace();
  const deleted = await deleteClient(clientId, organizationId);

  if (!deleted) {
    return { error: "This client could not be found." };
  }

  revalidatePath("/clients");
  redirect("/clients");
}
