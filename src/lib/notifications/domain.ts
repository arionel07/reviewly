import { notificationTypeEnum } from "@/db/schema";

export const notificationTypeValues = notificationTypeEnum.enumValues;
export type NotificationType = (typeof notificationTypeValues)[number];

export type NotificationSource = {
  projectId: string | null;
  feedbackId: string | null;
  projectReviewId: string | null;
};

export function getNotificationHref({
  projectId,
  feedbackId,
}: NotificationSource): string {
  if (projectId && feedbackId) {
    return `/projects/${projectId}/feedback/${feedbackId}`;
  }

  if (projectId) {
    return `/projects/${projectId}`;
  }

  return "/dashboard";
}
