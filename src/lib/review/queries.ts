import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  feedback,
  organization,
  projectReviews,
  projects,
  reviewAccessTokens,
} from "@/db/schema";
import { getFeedbackInProject } from "@/lib/feedback/queries";
import { isUuid } from "@/lib/db/is-uuid";
import { getProject } from "@/lib/projects/queries";
import {
  blockingFeedbackStatuses,
  type ProjectReviewStatus,
} from "@/lib/review/project-review";
import {
  generateRawReviewToken,
  hashReviewToken,
  isReviewTokenExpired,
  isValidRawReviewTokenFormat,
} from "@/lib/review/token";
import { getFeedbackScreenshotUrl } from "@/lib/storage/screenshot-url";
import { insertNotification } from "@/lib/notifications/queries";

const projectReviewColumns = {
  id: projectReviews.id,
  projectId: projectReviews.projectId,
  status: projectReviews.status,
  requestedAt: projectReviews.requestedAt,
  decidedAt: projectReviews.decidedAt,
  decisionNote: projectReviews.decisionNote,
  createdAt: projectReviews.createdAt,
  updatedAt: projectReviews.updatedAt,
};

export type ProjectReview = {
  id: string;
  projectId: string;
  status: ProjectReviewStatus;
  requestedAt: Date;
  decidedAt: Date | null;
  decisionNote: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ReviewTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type ProjectReviewRequestContext = {
  projectId: string;
  organizationId: string;
  projectName: string;
  clientName: string;
  clientEmail: string | null;
  organizationName: string;
};

async function getProjectReviewRequestContext(
  projectId: string,
  organizationId: string,
): Promise<ProjectReviewRequestContext | null> {
  if (!isUuid(projectId)) {
    return null;
  }

  const [row] = await db
    .select({
      projectId: projects.id,
      organizationId: projects.organizationId,
      projectName: projects.name,
      clientName: clients.name,
      clientEmail: clients.email,
      organizationName: organization.name,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .innerJoin(organization, eq(projects.organizationId, organization.id))
    .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
    .limit(1);

  return row ?? null;
}

async function insertFreshReviewAccessToken(
  tx: ReviewTransaction,
  projectId: string,
): Promise<{ id: string; createdAt: Date; rawToken: string }> {
  const now = new Date();

  await tx
    .update(reviewAccessTokens)
    .set({ revokedAt: now })
    .where(
      and(eq(reviewAccessTokens.projectId, projectId), isNull(reviewAccessTokens.revokedAt)),
    );

  const rawToken = generateRawReviewToken();
  const tokenHash = hashReviewToken(rawToken);
  const [created] = await tx
    .insert(reviewAccessTokens)
    .values({ projectId, tokenHash })
    .returning({ id: reviewAccessTokens.id, createdAt: reviewAccessTokens.createdAt });

  return { ...created, rawToken };
}

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

  const created = await db.transaction(async (tx) => {
    await tx
      .update(reviewAccessTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(reviewAccessTokens.projectId, projectId), isNull(reviewAccessTokens.revokedAt)),
      );

    const [token] = await tx
      .insert(reviewAccessTokens)
      .values({ projectId, tokenHash })
      .returning({ id: reviewAccessTokens.id, createdAt: reviewAccessTokens.createdAt });

    return token;
  });

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
  organizationId: string;
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
      projectOrganizationId: projects.organizationId,
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
    organizationId: row.projectOrganizationId,
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

/**
 * Project-level review rounds are intentionally separate from both the
 * project lifecycle and individual feedback statuses. These authenticated
 * helpers verify project ownership before reading review history.
 */
export async function listProjectReviews(
  projectId: string,
  organizationId: string,
): Promise<ProjectReview[]> {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return [];
  }

  return db
    .select(projectReviewColumns)
    .from(projectReviews)
    .where(eq(projectReviews.projectId, projectId))
    .orderBy(desc(projectReviews.requestedAt), desc(projectReviews.createdAt));
}

/**
 * Internal public-portal counterpart. The caller must have already resolved
 * projectId from a valid review access token; it must never be called with a
 * bare unauthenticated project id.
 */
export async function listProjectReviewsForAuthorizedProject(
  projectId: string,
): Promise<ProjectReview[]> {
  return db
    .select(projectReviewColumns)
    .from(projectReviews)
    .where(eq(projectReviews.projectId, projectId))
    .orderBy(desc(projectReviews.requestedAt), desc(projectReviews.createdAt));
}

export async function getLatestProjectReview(
  projectId: string,
  organizationId: string,
): Promise<ProjectReview | null> {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return null;
  }

  return getLatestProjectReviewForAuthorizedProject(projectId);
}

export async function getLatestProjectReviewForAuthorizedProject(
  projectId: string,
): Promise<ProjectReview | null> {
  const [review] = await db
    .select(projectReviewColumns)
    .from(projectReviews)
    .where(eq(projectReviews.projectId, projectId))
    .orderBy(desc(projectReviews.requestedAt), desc(projectReviews.createdAt))
    .limit(1);

  return review ?? null;
}

export async function getPendingProjectReview(
  projectId: string,
  organizationId: string,
): Promise<ProjectReview | null> {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return null;
  }

  return getPendingProjectReviewForAuthorizedProject(projectId);
}

export async function getPendingProjectReviewForAuthorizedProject(
  projectId: string,
): Promise<ProjectReview | null> {
  const [review] = await db
    .select(projectReviewColumns)
    .from(projectReviews)
    .where(and(eq(projectReviews.projectId, projectId), eq(projectReviews.status, "pending")))
    .orderBy(desc(projectReviews.requestedAt), desc(projectReviews.createdAt))
    .limit(1);

  return review ?? null;
}

export async function getProjectReviewReadiness(
  projectId: string,
  organizationId: string,
): Promise<{ ready: boolean; blockingCount: number } | null> {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return null;
  }

  const [result] = await db
    .select({ blockingCount: count() })
    .from(feedback)
    .where(
      and(eq(feedback.projectId, projectId), inArray(feedback.status, blockingFeedbackStatuses)),
    );

  const blockingCount = Number(result?.blockingCount ?? 0);

  return { ready: blockingCount === 0, blockingCount };
}

type RequestProjectReviewResult =
  | {
      review: ProjectReview;
      rawToken: string;
      context: ProjectReviewRequestContext;
    }
  | { error: "not_found" | "already_pending" | "blocking_feedback"; blockingCount?: number };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

/**
 * Creates a new immutable review round after tenant ownership and feedback
 * readiness checks. The partial unique index is the final race-safe guard
 * against two concurrent request-review submissions.
 */
export async function requestProjectReview(
  projectId: string,
  organizationId: string,
): Promise<RequestProjectReviewResult> {
  const context = await getProjectReviewRequestContext(projectId, organizationId);

  if (!context) {
    return { error: "not_found" };
  }

  const pending = await getPendingProjectReviewForAuthorizedProject(projectId);

  if (pending) {
    return { error: "already_pending" };
  }

  const readiness = await getProjectReviewReadiness(projectId, organizationId);

  if (!readiness) {
    return { error: "not_found" };
  }

  if (!readiness.ready) {
    return { error: "blocking_feedback", blockingCount: readiness.blockingCount };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const token = await insertFreshReviewAccessToken(tx, projectId);
      const [review] = await tx
        .insert(projectReviews)
        .values({
          projectId,
          status: "pending",
          requestedAt: new Date(),
        })
        .returning(projectReviewColumns);

      return { review, rawToken: token.rawToken };
    });

    return { ...result, context };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "already_pending" };
    }

    throw error;
  }
}

type RotatePendingReviewTokenResult =
  | { rawToken: string; context: ProjectReviewRequestContext }
  | { error: "not_found" | "no_pending_review" };

/**
 * Rotates access for an existing pending review without creating another
 * ProjectReview row. The old raw token is intentionally not recoverable.
 */
export async function rotatePendingProjectReviewToken(
  projectId: string,
  organizationId: string,
): Promise<RotatePendingReviewTokenResult> {
  const context = await getProjectReviewRequestContext(projectId, organizationId);

  if (!context) {
    return { error: "not_found" };
  }

  const pending = await getPendingProjectReviewForAuthorizedProject(projectId);

  if (!pending) {
    return { error: "no_pending_review" };
  }

  const rawToken = generateRawReviewToken();

  const rotated = await db.transaction(async (tx) => {
    const [stillPending] = await tx
      .select({ id: projectReviews.id })
      .from(projectReviews)
      .where(and(eq(projectReviews.id, pending.id), eq(projectReviews.status, "pending")))
      .limit(1);

    if (!stillPending) {
      return false;
    }

    await tx
      .update(reviewAccessTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(reviewAccessTokens.projectId, projectId), isNull(reviewAccessTokens.revokedAt)),
      );

    await tx.insert(reviewAccessTokens).values({
      projectId,
      tokenHash: hashReviewToken(rawToken),
    });

    return true;
  });

  if (!rotated) {
    return { error: "no_pending_review" };
  }

  return { rawToken, context };
}

type PublicReviewDecisionResult =
  | { project: ReviewPortalProject; review: ProjectReview }
  | { error: "invalid_token" | "no_pending_review" | "already_decided" };

/**
 * Authorizes a public decision from the bearer token and performs a
 * conditional update. The status predicate makes concurrent approve/request
 * changes calls mutually exclusive even if both read the same pending row.
 */
export async function decideProjectReviewByToken(
  rawToken: string,
  status: Extract<ProjectReviewStatus, "approved" | "changes_requested">,
): Promise<PublicReviewDecisionResult> {
  const project = await findProjectByReviewToken(rawToken);

  if (!project) {
    return { error: "invalid_token" };
  }

  const pending = await getPendingProjectReviewForAuthorizedProject(project.id);

  if (!pending) {
    return { error: "no_pending_review" };
  }

  const updated = await db.transaction(async (tx) => {
    const [review] = await tx
      .update(projectReviews)
      .set({ status, decidedAt: new Date() })
      .where(and(eq(projectReviews.id, pending.id), eq(projectReviews.status, "pending")))
      .returning(projectReviewColumns);

    if (!review) {
      return null;
    }

    const isApproval = status === "approved";
    await insertNotification(tx, {
      organizationId: project.organizationId,
      type: isApproval ? "review_approved" : "review_changes_requested",
      projectId: project.id,
      feedbackId: null,
      projectReviewId: review.id,
      title: isApproval ? "Project approved" : "Changes requested",
      body: isApproval
        ? `The client approved "${project.name}"`
        : `The client requested changes on "${project.name}"`,
    });

    return review;
  });

  if (!updated) {
    return { error: "already_decided" };
  }

  return { project, review: updated };
}
