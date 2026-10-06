"use server";

import { revalidatePath } from "next/cache";

import { buildAppUrl } from "@/lib/app-url";
import { requireWorkspace } from "@/lib/auth/session";
import {
  createAnonymousFeedbackComment,
  getFeedbackInProject,
  reopenFeedbackInProject,
} from "@/lib/feedback/queries";
import { canTransitionFeedbackStatus } from "@/lib/feedback/status";
import {
  createReviewAccessToken,
  decideProjectReviewByToken,
  findProjectByReviewToken,
  requestProjectReview,
  rotatePendingProjectReviewToken,
  revokeAllReviewTokens,
} from "@/lib/review/queries";
import { clientCommentSchema } from "@/lib/review/schemas";
import { getWorkspaceEmailRecipients } from "@/lib/email/recipients";
import {
  sendProjectDecisionEmail,
  sendReviewRequestedEmail,
} from "@/lib/email/send-email";
import { logger } from "@/lib/logging/logger";

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

  revalidatePath(`/projects/${projectId}`);

  return { url: buildAppUrl(`/r/${created.rawToken}`), rawToken: created.rawToken };
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

type ReviewEmailStatus = "sent" | "no_client_email" | "failed";

type ReviewDeliveryResult = {
  reviewCreated: boolean;
  emailSent: boolean;
  emailStatus: ReviewEmailStatus;
  reviewUrl: string;
  clientEmail: string | null;
};

type RequestProjectReviewActionResult = { error: string } | ReviewDeliveryResult;

function getReviewEmailStatus(result: Awaited<ReturnType<typeof sendReviewRequestedEmail>>): {
  emailSent: boolean;
  emailStatus: ReviewEmailStatus;
} {
  if (result.sent) {
    return { emailSent: true, emailStatus: "sent" };
  }

  return {
    emailSent: false,
    emailStatus: result.reason === "no_recipient" ? "no_client_email" : "failed",
  };
}

export async function requestProjectReviewAction(
  projectId: string,
): Promise<RequestProjectReviewActionResult> {
  const { organizationId } = await requireWorkspace();
  const result = await requestProjectReview(projectId, organizationId);

  if ("error" in result) {
    switch (result.error) {
      case "not_found":
        return { error: "This project could not be found." };
      case "already_pending":
        return { error: "This project already has a review in progress." };
      case "blocking_feedback":
        return {
          error: `${result.blockingCount ?? 0} feedback items still need attention.`,
        };
    }
  }

  const reviewUrl = buildAppUrl(`/r/${result.rawToken}`);
  const emailResult = await sendReviewRequestedEmail({
    to: result.context.clientEmail,
    projectId: result.context.projectId,
    organizationId: result.context.organizationId,
    projectName: result.context.projectName,
    workspaceName: result.context.organizationName,
    reviewUrl,
  });
  const delivery = getReviewEmailStatus(emailResult);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects`);

  return {
    reviewCreated: true,
    ...delivery,
    reviewUrl,
    clientEmail: result.context.clientEmail,
  };
}

export async function resendProjectReviewLinkAction(
  projectId: string,
): Promise<{ error: string } | ReviewDeliveryResult> {
  const { organizationId } = await requireWorkspace();
  const result = await rotatePendingProjectReviewToken(projectId, organizationId);

  if ("error" in result) {
    return {
      error:
        result.error === "not_found"
          ? "This project could not be found."
          : "There is no review awaiting a client decision.",
    };
  }

  const reviewUrl = buildAppUrl(`/r/${result.rawToken}`);
  const emailResult = await sendReviewRequestedEmail({
    to: result.context.clientEmail,
    projectId: result.context.projectId,
    organizationId: result.context.organizationId,
    projectName: result.context.projectName,
    workspaceName: result.context.organizationName,
    reviewUrl,
  });
  const delivery = getReviewEmailStatus(emailResult);

  revalidatePath(`/projects/${projectId}`);

  return {
    reviewCreated: false,
    ...delivery,
    reviewUrl,
    clientEmail: result.context.clientEmail,
  };
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

  const created = await createAnonymousFeedbackComment(
    feedbackId,
    project.id,
    project.organizationId,
    parsed.data,
  );

  if (!created) {
    return { error: "This feedback could not be found." };
  }

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

  const reopened = await reopenFeedbackInProject(feedbackId, project.id, project.organizationId);

  if (!reopened) {
    return { error: "Only resolved feedback can be reopened." };
  }

  revalidatePath(`/r/${rawToken}/feedback/${feedbackId}`);
  revalidatePath(`/r/${rawToken}`);
  revalidatePath(`/r/${rawToken}/feedback`);
}

async function decideProjectReviewAction(
  rawToken: string,
  status: "approved" | "changes_requested",
): Promise<PortalActionResult> {
  const result = await decideProjectReviewByToken(rawToken, status);

  if ("error" in result) {
    if (result.error === "invalid_token") {
      return { error: "This review link is no longer available." };
    }

    if (result.error === "no_pending_review") {
      return { error: "There is no review awaiting a client decision." };
    }

    return { error: "This review has already been decided." };
  }

  try {
    const recipients = await getWorkspaceEmailRecipients(result.project.organizationId);
    await sendProjectDecisionEmail({
      to: recipients,
      projectId: result.project.id,
      organizationId: result.project.organizationId,
      projectName: result.project.name,
      decision: status,
    });
  } catch {
    logger.error(
      {
        eventType: status === "approved" ? "review_approved" : "review_changes_requested",
        projectId: result.project.id,
        organizationId: result.project.organizationId,
        reason: "recipient_resolution_failed",
      },
      "Transactional email was not sent",
    );
  }

  revalidatePath(`/r/${rawToken}`);
  revalidatePath(`/r/${rawToken}/feedback`);
  revalidatePath(`/projects/${result.project.id}`);
}

export async function approveProjectReviewAction(rawToken: string): Promise<PortalActionResult> {
  return decideProjectReviewAction(rawToken, "approved");
}

export async function requestProjectChangesAction(rawToken: string): Promise<PortalActionResult> {
  return decideProjectReviewAction(rawToken, "changes_requested");
}
