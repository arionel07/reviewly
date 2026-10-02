"use server";

import { revalidatePath } from "next/cache";

import { requireWorkspace } from "@/lib/auth/session";
import {
  createAnonymousFeedbackComment,
  getFeedbackInProject,
  updateFeedbackStatusInProject,
} from "@/lib/feedback/queries";
import { canTransitionFeedbackStatus } from "@/lib/feedback/status";
import {
  createReviewAccessToken,
  findProjectByReviewToken,
  revokeAllReviewTokens,
} from "@/lib/review/queries";
import { clientCommentSchema } from "@/lib/review/schemas";
import { getAppBaseUrl } from "@/lib/widget/app-url";

type ReviewLinkActionResult = { url: string; rawToken: string } | { error: string };

/**
 * Agency-side only: requires an authenticated workspace member, and
 * createReviewAccessToken itself re-verifies the project belongs to
 * this organization before issuing anything. The raw token is returned
 * exactly once, in this action's result — never written anywhere it
 * could be read again later (see src/lib/review/token.ts).
 */
export async function createReviewLinkAction(projectId: string): Promise<ReviewLinkActionResult> {
  const { organizationId } = await requireWorkspace();

  const created = await createReviewAccessToken(projectId, organizationId);

  if (!created) {
    return { error: "This project could not be found." };
  }

  const appBaseUrl = await getAppBaseUrl();
  revalidatePath(`/projects/${projectId}`);

  return { url: `${appBaseUrl}/r/${created.rawToken}`, rawToken: created.rawToken };
}

export async function revokeReviewLinksAction(
  projectId: string,
): Promise<{ error: string } | undefined> {
  const { organizationId } = await requireWorkspace();

  const revoked = await revokeAllReviewTokens(projectId, organizationId);

  if (!revoked) {
    return { error: "This project could not be found." };
  }

  revalidatePath(`/projects/${projectId}`);
}

type PortalActionResult = { error: string } | undefined;

/**
 * Public — called from the unauthenticated review portal. Every call
 * re-derives project access from rawToken itself; a page having
 * rendered earlier (even moments ago) is never treated as standing
 * authorization for this request (see the Client Review Portal
 * report's security model). feedbackId is independently confirmed to
 * belong to that exact project before anything is written.
 */
export async function submitClientCommentAction(
  rawToken: string,
  feedbackId: string,
  input: unknown,
): Promise<PortalActionResult> {
  const project = await findProjectByReviewToken(rawToken);

  if (!project) {
    return { error: "This review link is no longer available." };
  }

  const parsed = clientCommentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid comment." };
  }

  const feedbackItem = await getFeedbackInProject(feedbackId, project.id);

  if (!feedbackItem) {
    return { error: "This feedback could not be found." };
  }

  await createAnonymousFeedbackComment(feedbackId, parsed.data);

  revalidatePath(`/r/${rawToken}/feedback/${feedbackId}`);
}

/**
 * Public — the client's only status mutation. Reuses the same
 * canTransitionFeedbackStatus table every other status change goes
 * through (no separate portal-only transition logic), but additionally
 * requires the *current* status to be exactly "resolved": the shared
 * table alone would also allow open→in_progress, open→resolved, and
 * reopened→in_progress/resolved, none of which a client may ever
 * trigger (see the task's explicit "client must not be able to
 * arbitrarily set open/in_progress/resolved").
 */
export async function reopenFeedbackAction(
  rawToken: string,
  feedbackId: string,
): Promise<PortalActionResult> {
  const project = await findProjectByReviewToken(rawToken);

  if (!project) {
    return { error: "This review link is no longer available." };
  }

  const feedbackItem = await getFeedbackInProject(feedbackId, project.id);

  if (!feedbackItem) {
    return { error: "This feedback could not be found." };
  }

  if (feedbackItem.status !== "resolved" || !canTransitionFeedbackStatus(feedbackItem.status, "reopened")) {
    return { error: "Only resolved feedback can be reopened." };
  }

  await updateFeedbackStatusInProject(feedbackId, project.id, "reopened");

  revalidatePath(`/r/${rawToken}/feedback/${feedbackId}`);
  revalidatePath(`/r/${rawToken}`);
  revalidatePath(`/r/${rawToken}/feedback`);
}
