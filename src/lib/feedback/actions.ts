"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireWorkspace } from "@/lib/auth/session";
import {
  createFeedback,
  createFeedbackComment,
  deleteFeedback,
  getFeedback,
  updateFeedback,
  updateFeedbackStatus,
} from "@/lib/feedback/queries";
import {
  feedbackCommentSchema,
  feedbackSchema,
  feedbackStatusChangeSchema,
} from "@/lib/feedback/schemas";
import { canTransitionFeedbackStatus } from "@/lib/feedback/status";
import { getProject } from "@/lib/projects/queries";

type FeedbackActionResult = { error: string };

export async function createFeedbackAction(
  projectId: string,
  input: unknown,
): Promise<FeedbackActionResult> {
  const { organizationId } = await requireWorkspace();

  // The project must belong to this organization before anything else —
  // a projectId is never trusted just because it showed up in a route
  // param or was submitted alongside the form.
  const project = await getProject(projectId, organizationId);

  if (!project) {
    return { error: "This project could not be found." };
  }

  const parsed = feedbackSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter valid feedback." };
  }

  const created = await createFeedback(projectId, organizationId, parsed.data);

  if (!created) {
    return { error: "This project could not be found." };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/feedback`);
  redirect(`/projects/${projectId}/feedback/${created.id}`);
}

export async function updateFeedbackAction(
  feedbackId: string,
  projectId: string,
  input: unknown,
): Promise<FeedbackActionResult> {
  const { organizationId } = await requireWorkspace();
  const parsed = feedbackSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter valid feedback." };
  }

  const updated = await updateFeedback(feedbackId, projectId, organizationId, parsed.data);

  if (!updated) {
    return { error: "This feedback could not be found." };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/feedback`);
  revalidatePath(`/projects/${projectId}/feedback/${feedbackId}`);
  redirect(`/projects/${projectId}/feedback/${feedbackId}`);
}

export async function changeFeedbackStatusAction(
  feedbackId: string,
  projectId: string,
  input: unknown,
): Promise<FeedbackActionResult | undefined> {
  const { organizationId } = await requireWorkspace();
  const parsed = feedbackStatusChangeSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Enter a valid status." };
  }

  const existing = await getFeedback(feedbackId, projectId, organizationId);

  if (!existing) {
    return { error: "This feedback could not be found." };
  }

  if (!canTransitionFeedbackStatus(existing.status, parsed.data.status)) {
    return {
      error: `Feedback cannot move from "${existing.status}" to "${parsed.data.status}".`,
    };
  }

  await updateFeedbackStatus(feedbackId, projectId, organizationId, parsed.data.status);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/feedback`);
  revalidatePath(`/projects/${projectId}/feedback/${feedbackId}`);
}

export async function deleteFeedbackAction(
  feedbackId: string,
  projectId: string,
): Promise<FeedbackActionResult> {
  const { organizationId } = await requireWorkspace();
  const deleted = await deleteFeedback(feedbackId, projectId, organizationId);

  if (!deleted) {
    return { error: "This feedback could not be found." };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/feedback`);
  redirect(`/projects/${projectId}/feedback`);
}

export async function createFeedbackCommentAction(
  feedbackId: string,
  projectId: string,
  input: unknown,
): Promise<FeedbackActionResult | undefined> {
  // Never trust that a feedbackId arriving from the client is safe just
  // because it came from a page the user was already looking at —
  // createFeedbackComment re-verifies the feedback belongs to a project
  // in this organization before writing anything.
  const { organizationId, user } = await requireWorkspace();
  const parsed = feedbackCommentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a comment." };
  }

  const created = await createFeedbackComment(
    feedbackId,
    projectId,
    organizationId,
    user.id,
    parsed.data.body,
  );

  if (!created) {
    return { error: "This feedback could not be found." };
  }

  revalidatePath(`/projects/${projectId}/feedback/${feedbackId}`);
}
