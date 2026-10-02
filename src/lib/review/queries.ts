import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { projects, reviewAccessTokens } from "@/db/schema";
import { getFeedbackInProject } from "@/lib/feedback/queries";
import { getProject } from "@/lib/projects/queries";
import {
  generateRawReviewToken,
  hashReviewToken,
  isReviewTokenExpired,
  isValidRawReviewTokenFormat,
} from "@/lib/review/token";
import { getFeedbackScreenshotUrl } from "@/lib/storage/screenshot-url";

/**
 * Creates a new review access token for a project, after confirming the
 * project belongs to the caller's own organization — the same
 * tenant-ownership check every other project mutation goes through
 * (getProject). Returns the raw token exactly once; only its hash is
 * ever written to the database. Returns null if the project doesn't
 * belong to this organization (including "doesn't exist") — callers
 * must not distinguish the two.
 */
export async function createReviewAccessToken(
  projectId: string,
  organizationId: string,
): Promise<{ rawToken: string; id: string; createdAt: Date } | null> {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return null;
  }

  const rawToken = generateRawReviewToken();
  const tokenHash = hashReviewToken(rawToken);

  const [created] = await db
    .insert(reviewAccessTokens)
    .values({ projectId, tokenHash })
    .returning({ id: reviewAccessTokens.id, createdAt: reviewAccessTokens.createdAt });

  return { rawToken, id: created.id, createdAt: created.createdAt };
}

/**
 * Whether this project currently has at least one usable (not revoked,
 * not expired) review link — used only to decide what the "Review
 * link" section on the Project detail page shows; never used to
 * authorize anything, since it never touches a specific token.
 */
export async function hasActiveReviewToken(
  projectId: string,
  organizationId: string,
): Promise<boolean> {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return false;
  }

  const tokens = await db
    .select({
      expiresAt: reviewAccessTokens.expiresAt,
    })
    .from(reviewAccessTokens)
    .where(
      and(eq(reviewAccessTokens.projectId, projectId), isNull(reviewAccessTokens.revokedAt)),
    );

  return tokens.some((token) => !isReviewTokenExpired(token.expiresAt));
}

/**
 * Revokes every currently-active review token for a project in one
 * step — deliberately not scoped to "the most recent one", so the
 * dashboard's single "Revoke access" action can't leave an older,
 * still-valid link usable by mistake (see the Phase 1 report's token
 * UI decision). Tenant-checked the same way creation is.
 */
export async function revokeAllReviewTokens(
  projectId: string,
  organizationId: string,
): Promise<boolean> {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return false;
  }

  await db
    .update(reviewAccessTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(reviewAccessTokens.projectId, projectId), isNull(reviewAccessTokens.revokedAt)),
    );

  return true;
}

export type ReviewPortalProject = {
  id: string;
  name: string;
  websiteUrl: string;
  status: "draft" | "active" | "completed" | "archived";
};

/**
 * The one entry point the public portal uses to turn a raw token (from
 * the /r/[token] URL) into a project it may read. Format is checked
 * before anything touches the database; the token is then hashed and
 * looked up by hash (the raw value is never compared directly, nor
 * ever persisted — see src/lib/review/token.ts); a row that is revoked,
 * expired, or simply doesn't exist all return the same null, by design
 * (see the Phase 1 report's "do not reveal why a link doesn't work").
 * Every public mutation (comment, reopen) must call this again itself
 * — a page having rendered earlier is never treated as authorization
 * for a later request.
 */
export async function findProjectByReviewToken(
  rawToken: string,
): Promise<ReviewPortalProject | null> {
  if (!isValidRawReviewTokenFormat(rawToken)) {
    return null;
  }

  const tokenHash = hashReviewToken(rawToken);

  const [row] = await db
    .select({
      revokedAt: reviewAccessTokens.revokedAt,
      expiresAt: reviewAccessTokens.expiresAt,
      projectId: projects.id,
      projectName: projects.name,
      projectWebsiteUrl: projects.websiteUrl,
      projectStatus: projects.status,
    })
    .from(reviewAccessTokens)
    .innerJoin(projects, eq(reviewAccessTokens.projectId, projects.id))
    .where(eq(reviewAccessTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row || row.revokedAt !== null || isReviewTokenExpired(row.expiresAt)) {
    return null;
  }

  return {
    id: row.projectId,
    name: row.projectName,
    websiteUrl: row.projectWebsiteUrl,
    status: row.projectStatus,
  };
}

/**
 * The review portal's only path to a signed screenshot URL. Deliberately
 * not the authenticated dashboard's pattern (resolve feedback by
 * organizationId, then sign) — here, access is proven by projectId
 * (itself already resolved from a valid review token), and
 * getFeedbackInProject independently re-confirms feedbackId belongs to
 * that exact project before any key is ever handed to the signer.
 * Returns null if the feedback doesn't exist, doesn't belong to this
 * project, or has no screenshot — the caller renders nothing instead of
 * guessing why.
 */
export async function getReviewFeedbackScreenshotUrl(
  feedbackId: string,
  projectId: string,
): Promise<string | null> {
  const feedbackItem = await getFeedbackInProject(feedbackId, projectId);

  if (!feedbackItem?.screenshotKey) {
    return null;
  }

  return getFeedbackScreenshotUrl(feedbackItem.screenshotKey);
}
