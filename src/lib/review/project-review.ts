import { projectReviewStatusEnum } from "@/db/schema";
import type { FeedbackStatus } from "@/lib/feedback/status";

export const projectReviewStatusValues = projectReviewStatusEnum.enumValues;

export type ProjectReviewStatus = (typeof projectReviewStatusValues)[number];

export const blockingFeedbackStatuses: readonly FeedbackStatus[] = [
  "open",
  "in_progress",
  "reopened",
];

export function isBlockingFeedbackStatus(status: FeedbackStatus): boolean {
  return blockingFeedbackStatuses.includes(status);
}

export function getProjectReviewStatusLabel(status: ProjectReviewStatus): string {
  switch (status) {
    case "pending":
      return "In review";
    case "changes_requested":
      return "Changes requested";
    case "approved":
      return "Approved";
  }
}
