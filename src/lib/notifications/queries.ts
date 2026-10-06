import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { notificationReads, notifications } from "@/db/schema";
import {
  getNotificationHref,
  type NotificationSource,
  type NotificationType,
} from "@/lib/notifications/domain";

type NotificationTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type NotificationInput = NotificationSource & {
  organizationId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
};

export type NotificationDto = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string;
  createdAt: Date;
  read: boolean;
};

/**
 * Inserts a historical workspace event inside the caller's transaction.
 * Mutation boundaries own the transaction so notification creation cannot
 * survive a failed feedback/comment/review mutation.
 */
export async function insertNotification(
  tx: NotificationTransaction,
  input: NotificationInput,
) {
  const [created] = await tx
    .insert(notifications)
    .values({
      organizationId: input.organizationId,
      type: input.type,
      projectId: input.projectId,
      feedbackId: input.feedbackId,
      projectReviewId: input.projectReviewId,
      title: input.title,
      body: input.body ?? null,
    })
    .returning();

  return created;
}

export async function listNotifications(
  organizationId: string,
  userId: string,
  limit = 20,
): Promise<NotificationDto[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      projectId: notifications.projectId,
      feedbackId: notifications.feedbackId,
      projectReviewId: notifications.projectReviewId,
      createdAt: notifications.createdAt,
      readAt: notificationReads.readAt,
    })
    .from(notifications)
    .leftJoin(
      notificationReads,
      and(
        eq(notificationReads.notificationId, notifications.id),
        eq(notificationReads.userId, userId),
      ),
    )
    .where(eq(notifications.organizationId, organizationId))
    .orderBy(desc(notifications.createdAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: getNotificationHref({
      projectId: row.projectId,
      feedbackId: row.feedbackId,
      projectReviewId: row.projectReviewId,
    }),
    createdAt: row.createdAt,
    read: row.readAt !== null,
  }));
}

export async function getUnreadNotificationCount(
  organizationId: string,
  userId: string,
): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .leftJoin(
      notificationReads,
      and(
        eq(notificationReads.notificationId, notifications.id),
        eq(notificationReads.userId, userId),
      ),
    )
    .where(
      and(eq(notifications.organizationId, organizationId), isNull(notificationReads.notificationId)),
    );

  return Number(result?.count ?? 0);
}

export async function markNotificationRead(
  notificationId: string,
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const [notification] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.organizationId, organizationId)))
    .limit(1);

  if (!notification) {
    return false;
  }

  await db
    .insert(notificationReads)
    .values({ notificationId, userId, readAt: new Date() })
    .onConflictDoNothing();

  return true;
}

export async function markAllNotificationsRead(
  organizationId: string,
  userId: string,
): Promise<number> {
  const unread = await db
    .select({ id: notifications.id })
    .from(notifications)
    .leftJoin(
      notificationReads,
      and(
        eq(notificationReads.notificationId, notifications.id),
        eq(notificationReads.userId, userId),
      ),
    )
    .where(
      and(eq(notifications.organizationId, organizationId), isNull(notificationReads.notificationId)),
    );

  if (unread.length === 0) {
    return 0;
  }

  const now = new Date();
  await db
    .insert(notificationReads)
    .values(unread.map(({ id }) => ({ notificationId: id, userId, readAt: now })))
    .onConflictDoNothing();

  return unread.length;
}
