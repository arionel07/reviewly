import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { organization } from "@/db/schema";
import { auth } from "@/lib/auth/auth";

/**
 * Cached per-request so the layout check and a page's own data fetch don't
 * each re-resolve the session independently.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

/**
 * Better Auth's `activeOrganizationId` lives on the session row, not the
 * user: a brand new sign-in session starts with no active organization set,
 * even for a user who already belongs to one from a previous session. If
 * the current session has none, fall back to the user's first membership
 * (there is no workspace-switcher yet, so "first" is also "only") and
 * persist it as the session's active organization via Better Auth's own
 * API, rather than inventing separate state to track it.
 */
async function resolveActiveOrganizationId(
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
) {
  if (session.session.activeOrganizationId) {
    return session.session.activeOrganizationId;
  }

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });
  const firstOrganization = organizations[0];

  if (!firstOrganization) {
    return null;
  }

  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: { organizationId: firstOrganization.id },
  });

  return firstOrganization.id;
}

/**
 * For routes that require both an authenticated user and an active
 * workspace (Better Auth organization). Redirects to /onboarding when the
 * user has no workspace at all.
 */
export async function requireWorkspace() {
  const session = await requireSession();
  const organizationId = await resolveActiveOrganizationId(session);

  if (!organizationId) {
    redirect("/onboarding");
  }

  return { ...session, organizationId };
}

/**
 * For the onboarding route: requires an authenticated user, but redirects
 * to /dashboard if a workspace already exists so onboarding can't be
 * revisited (or used to create a second workspace) once it's done.
 */
export async function redirectIfHasWorkspace() {
  const session = await requireSession();
  const organizationId = await resolveActiveOrganizationId(session);

  if (organizationId) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * All workspaces (Better Auth organizations) the current user belongs to.
 * There is no switcher UI yet — the shell only shows the active workspace —
 * but this keeps the shape ready for one without inventing separate state:
 * the list always comes straight from Better Auth's own API.
 */
export async function listWorkspaces() {
  return auth.api.listOrganizations({ headers: await headers() });
}

export async function getWorkspace(organizationId: string) {
  const [workspace] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  return workspace ?? null;
}
