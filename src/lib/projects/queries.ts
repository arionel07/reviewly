import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { isUuid } from "@/lib/db/is-uuid";
import type { ProjectStatus } from "@/lib/projects/schemas";

/**
 * All projects in a workspace, newest-updated first, with just enough of
 * the owning client joined in to show which client each project belongs
 * to. `organizationId` must come from the caller's own authenticated
 * session (see requireWorkspace) — this trusts whatever it's given.
 */
export async function listProjects(organizationId: string) {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      websiteUrl: projects.websiteUrl,
      status: projects.status,
      updatedAt: projects.updatedAt,
      clientId: projects.clientId,
      clientName: clients.name,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.organizationId, organizationId))
    .orderBy(desc(projects.updatedAt));
}

/**
 * A single project, scoped to the given organization, with its client's
 * name joined in. Returns null both when the id doesn't exist at all and
 * when it belongs to a different organization — callers must not
 * distinguish between the two.
 */
export async function getProject(projectId: string, organizationId: string) {
  if (!isUuid(projectId)) {
    return null;
  }

  const [project] = await db
    .select({
      id: projects.id,
      clientId: projects.clientId,
      name: projects.name,
      websiteUrl: projects.websiteUrl,
      status: projects.status,
      publicKey: projects.publicKey,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      clientName: clients.name,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(
      and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)),
    )
    .limit(1);

  return project ?? null;
}

/**
 * Projects for a single client, scoped to the given organization — used
 * by the client detail page. Scoping by organizationId here too (not
 * just clientId) means this can never be used to list another
 * workspace's projects even if clientId were somehow wrong.
 */
export async function listProjectsForClient(
  clientId: string,
  organizationId: string,
) {
  if (!isUuid(clientId)) {
    return [];
  }

  return db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
    })
    .from(projects)
    .where(
      and(eq(projects.clientId, clientId), eq(projects.organizationId, organizationId)),
    )
    .orderBy(desc(projects.updatedAt));
}

type ProjectWriteInput = {
  name: string;
  clientId: string;
  websiteUrl: string;
  status: ProjectStatus;
};

export async function createProject(
  organizationId: string,
  data: ProjectWriteInput & { publicKey: string },
) {
  const [created] = await db
    .insert(projects)
    .values({
      organizationId,
      clientId: data.clientId,
      name: data.name,
      websiteUrl: data.websiteUrl,
      status: data.status,
      publicKey: data.publicKey,
    })
    .returning();

  return created;
}

/**
 * Updates a project, but only the row that matches both `projectId` AND
 * `organizationId`. Returns null if no such row exists — including when
 * `projectId` is real but belongs to a different organization — so a
 * cross-tenant update is a silent no-op rather than a write. Never
 * touches `publicKey`; it's generated once at creation.
 */
export async function updateProject(
  projectId: string,
  organizationId: string,
  data: ProjectWriteInput,
) {
  if (!isUuid(projectId)) {
    return null;
  }

  const [updated] = await db
    .update(projects)
    .set({
      clientId: data.clientId,
      name: data.name,
      websiteUrl: data.websiteUrl,
      status: data.status,
    })
    .where(
      and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)),
    )
    .returning();

  return updated ?? null;
}

/**
 * Deletes a project, scoped the same way as updateProject — a
 * cross-tenant delete affects zero rows instead of someone else's
 * project.
 */
export async function deleteProject(projectId: string, organizationId: string) {
  if (!isUuid(projectId)) {
    return null;
  }

  const [deleted] = await db
    .delete(projects)
    .where(
      and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)),
    )
    .returning();

  return deleted ?? null;
}
