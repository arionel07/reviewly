import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { feedback, feedbackComments, projects, user } from "@/db/schema";
import { isUuid } from "@/lib/db/is-uuid";
import { getProject } from "@/lib/projects/queries";
import type { FeedbackStatus } from "@/lib/feedback/status";

const feedbackColumns = {
  id: feedback.id,
  projectId: feedback.projectId,
  status: feedback.status,
  pageUrl: feedback.pageUrl,
  selector: feedback.selector,
  elementText: feedback.elementText,
  screenshotKey: feedback.screenshotKey,
  viewportWidth: feedback.viewportWidth,
  viewportHeight: feedback.viewportHeight,
  userAgent: feedback.userAgent,
  authorName: feedback.authorName,
  authorEmail: feedback.authorEmail,
  message: feedback.message,
  createdAt: feedback.createdAt,
  updatedAt: feedback.updatedAt,
};

/**
 * The single centralized tenant check for every feedback-by-id operation:
 * feedback is only reachable by also joining through its project and
 * requiring that project's organizationId to match. Every read and write
 * below goes through this (directly, or via a prior getProject check for
 * creation) rather than re-implementing the join — feedback has no
 * organizationId column of its own, so this join is the only thing
 * standing between a UUID and someone else's data.
 */
async function findFeedbackScoped(
  feedbackId: string,
  projectId: string,
  organizationId: string,
) {
  if (!isUuid(feedbackId) || !isUuid(projectId)) {
    return null;
  }

  const [row] = await db
    .select(feedbackColumns)
    .from(feedback)
    .innerJoin(projects, eq(feedback.projectId, projects.id))
    .where(
      and(
        eq(feedback.id, feedbackId),
        eq(feedback.projectId, projectId),
        eq(projects.organizationId, organizationId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getFeedback(
  feedbackId: string,
  projectId: string,
  organizationId: string,
) {
  return findFeedbackScoped(feedbackId, projectId, organizationId);
}

/**
 * All feedback for a project, newest first, optionally filtered by
 * status. One ownership check (project → organization) plus one feedback
 * query — never a per-row lookup, so this stays O(1) queries regardless
 * of how many feedback rows the project has.
 */
export async function listFeedbackForProject(
  projectId: string,
  organizationId: string,
  status?: FeedbackStatus,
) {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return [];
  }

  const conditions = [eq(feedback.projectId, projectId)];

  if (status) {
    conditions.push(eq(feedback.status, status));
  }

  return db
    .select(feedbackColumns)
    .from(feedback)
    .where(and(...conditions))
    .orderBy(desc(feedback.createdAt));
}

type FeedbackWriteInput = {
  message: string;
  pageUrl: string;
  authorName?: string;
  authorEmail?: string;
};

/**
 * The one place a feedback row actually gets inserted — shared by manual
 * creation (createFeedback, below) and the widget's Route Handler
 * (src/app/api/widget/feedback/route.ts), per the task's "Manual Server
 * Action / Widget Route Handler both feed into the Feedback domain"
 * architecture. It trusts `projectId` completely and never takes a
 * status, organizationId, or authorUserId from its caller's data —
 * status always starts at the column default ("open"); callers are
 * responsible for having already authorized the write (an org-scoped
 * getProject check for the manual path, a publicKey + origin check for
 * the widget path) before calling this.
 */
export async function insertFeedback(
  projectId: string,
  data: FeedbackWriteInput & {
    selector?: string;
    elementText?: string;
    screenshotKey?: string;
    viewportWidth?: number;
    viewportHeight?: number;
    userAgent?: string;
  },
) {
  const [created] = await db
    .insert(feedback)
    .values({
      projectId,
      message: data.message,
      pageUrl: data.pageUrl,
      authorName: data.authorName ?? null,
      authorEmail: data.authorEmail ?? null,
      selector: data.selector ?? null,
      elementText: data.elementText ?? null,
      screenshotKey: data.screenshotKey ?? null,
      viewportWidth: data.viewportWidth ?? null,
      viewportHeight: data.viewportHeight ?? null,
      userAgent: data.userAgent ?? null,
    })
    .returning();

  return created;
}

/**
 * Inserts feedback under a project, but only after confirming that
 * project belongs to the given organization — the project is the only
 * tenant anchor a brand-new feedback row has. This is the manual-
 * creation entry point; it only ever sets the user-authored fields the
 * manual form collects (see insertFeedback for the shared primitive
 * widget submissions also go through).
 */
export async function createFeedback(
  projectId: string,
  organizationId: string,
  data: FeedbackWriteInput,
) {
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return null;
  }

  return insertFeedback(projectId, data);
}

/**
 * Updates only the user-authored fields (message, pageUrl, author
 * name/email) — never status (see changeFeedbackStatus) and never the
 * browser-captured context fields, which aren't user input to begin
 * with for manually-created feedback and would misrepresent captured
 * context for widget-submitted feedback later.
 */
export async function updateFeedback(
  feedbackId: string,
  projectId: string,
  organizationId: string,
  data: FeedbackWriteInput,
) {
  const existing = await findFeedbackScoped(feedbackId, projectId, organizationId);

  if (!existing) {
    return null;
  }

  const [updated] = await db
    .update(feedback)
    .set({
      message: data.message,
      pageUrl: data.pageUrl,
      authorName: data.authorName ?? null,
      authorEmail: data.authorEmail ?? null,
    })
    .where(eq(feedback.id, feedbackId))
    .returning();

  return updated ?? null;
}

export async function updateFeedbackStatus(
  feedbackId: string,
  projectId: string,
  organizationId: string,
  status: FeedbackStatus,
) {
  const existing = await findFeedbackScoped(feedbackId, projectId, organizationId);

  if (!existing) {
    return null;
  }

  const [updated] = await db
    .update(feedback)
    .set({ status })
    .where(eq(feedback.id, feedbackId))
    .returning();

  return updated ?? null;
}

export async function deleteFeedback(
  feedbackId: string,
  projectId: string,
  organizationId: string,
) {
  const existing = await findFeedbackScoped(feedbackId, projectId, organizationId);

  if (!existing) {
    return null;
  }

  const [deleted] = await db
    .delete(feedback)
    .where(eq(feedback.id, feedbackId))
    .returning();

  return deleted ?? null;
}

/**
 * Comments for a piece of feedback, with the authoring user's name
 * joined in (a left join: authorUserId is nullable and set null if the
 * user is later deleted, per src/db/schema/feedback-comments.ts).
 */
export async function listFeedbackComments(
  feedbackId: string,
  projectId: string,
  organizationId: string,
) {
  const owned = await findFeedbackScoped(feedbackId, projectId, organizationId);

  if (!owned) {
    return [];
  }

  return db
    .select({
      id: feedbackComments.id,
      body: feedbackComments.body,
      authorName: feedbackComments.authorName,
      authorEmail: feedbackComments.authorEmail,
      authorUserName: user.name,
      createdAt: feedbackComments.createdAt,
    })
    .from(feedbackComments)
    .leftJoin(user, eq(feedbackComments.authorUserId, user.id))
    .where(eq(feedbackComments.feedbackId, feedbackId))
    .orderBy(feedbackComments.createdAt);
}

/**
 * Adds a comment as the current authenticated workspace member.
 * authorUserId always comes from the server-side session (see
 * createFeedbackCommentAction) — never from the browser — and
 * authorName/authorEmail are left null, since those are reserved for a
 * future client-authored comment flow that doesn't exist yet.
 */
export async function createFeedbackComment(
  feedbackId: string,
  projectId: string,
  organizationId: string,
  authorUserId: string,
  body: string,
) {
  const owned = await findFeedbackScoped(feedbackId, projectId, organizationId);

  if (!owned) {
    return null;
  }

  const [created] = await db
    .insert(feedbackComments)
    .values({ feedbackId, authorUserId, body })
    .returning();

  return created;
}
