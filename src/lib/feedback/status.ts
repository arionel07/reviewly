import { feedbackStatusEnum } from "@/db/schema";

export const feedbackStatusValues = feedbackStatusEnum.enumValues;

export type FeedbackStatus = (typeof feedbackStatusValues)[number];

/**
 * The only transitions the product currently recognizes. Kept as a small
 * lookup table rather than a workflow engine — see docs/DECISIONS.md
 * (ADR-010): approval/review state is a separate, later concern, so this
 * never grows an "approved" or "closed" status.
 */
const ALLOWED_TRANSITIONS: Record<FeedbackStatus, readonly FeedbackStatus[]> = {
  open: ["in_progress", "resolved"],
  in_progress: ["resolved"],
  resolved: ["reopened"],
  reopened: ["in_progress", "resolved"],
};

export function getAvailableFeedbackTransitions(
  status: FeedbackStatus,
): readonly FeedbackStatus[] {
  return ALLOWED_TRANSITIONS[status];
}

export function canTransitionFeedbackStatus(
  from: FeedbackStatus,
  to: FeedbackStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
