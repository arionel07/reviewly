"use server";

import { revalidatePath } from "next/cache";

import { requireWorkspace } from "@/lib/auth/session";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/queries";

type NotificationActionResult = { error: string } | undefined;

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  const { organizationId, user } = await requireWorkspace();
  const marked = await markNotificationRead(notificationId, organizationId, user.id);

  if (!marked) {
    return { error: "This notification could not be found." };
  }

  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  const { organizationId, user } = await requireWorkspace();
  await markAllNotificationsRead(organizationId, user.id);
  revalidatePath("/dashboard");
  return undefined;
}
