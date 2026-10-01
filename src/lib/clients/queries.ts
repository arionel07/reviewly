import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";

/**
 * All clients in a workspace, newest first. `organizationId` must come
 * from the caller's own authenticated session (see requireWorkspace) —
 * this function trusts whatever it's given, so it must never be called
 * with an organizationId read from user input.
 */
export async function listClients(organizationId: string) {
  return db
    .select()
    .from(clients)
    .where(eq(clients.organizationId, organizationId))
    .orderBy(desc(clients.createdAt));
}

/**
 * A single client, scoped to the given organization. Returns null both
 * when the id doesn't exist at all and when it belongs to a different
 * organization — callers must not distinguish between the two, so a
 * cross-tenant request can't be used to confirm a UUID belongs to someone
 * else's workspace.
 */
export async function getClient(clientId: string, organizationId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(
      and(eq(clients.id, clientId), eq(clients.organizationId, organizationId)),
    )
    .limit(1);

  return client ?? null;
}

type ClientWriteInput = { name: string; email?: string };

export async function createClient(
  organizationId: string,
  data: ClientWriteInput,
) {
  const [created] = await db
    .insert(clients)
    .values({ organizationId, name: data.name, email: data.email ?? null })
    .returning();

  return created;
}

/**
 * Updates a client, but only the row that matches both `clientId` AND
 * `organizationId`. Returns null if no such row exists — including when
 * `clientId` is real but belongs to a different organization — so a
 * cross-tenant update is a silent no-op rather than a write.
 */
export async function updateClient(
  clientId: string,
  organizationId: string,
  data: ClientWriteInput,
) {
  const [updated] = await db
    .update(clients)
    .set({ name: data.name, email: data.email ?? null })
    .where(
      and(eq(clients.id, clientId), eq(clients.organizationId, organizationId)),
    )
    .returning();

  return updated ?? null;
}

/**
 * Deletes a client, scoped the same way as updateClient — a cross-tenant
 * delete affects zero rows instead of someone else's client.
 */
export async function deleteClient(clientId: string, organizationId: string) {
  const [deleted] = await db
    .delete(clients)
    .where(
      and(eq(clients.id, clientId), eq(clients.organizationId, organizationId)),
    )
    .returning();

  return deleted ?? null;
}
