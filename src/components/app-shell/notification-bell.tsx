"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import type { NotificationDto } from "@/lib/notifications/queries";

type NotificationItem = Omit<NotificationDto, "createdAt"> & { createdAt: string };

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const markReadAndNavigate = (notification: NotificationItem) => {
    setError(null);
    startTransition(async () => {
      const result = await markNotificationReadAction(notification.id);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
      if (!notification.read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
      router.push(notification.href);
    });
  };

  const markAllRead = () => {
    setError(null);
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();

      if (result?.error) {
        setError(result.error);
        return;
      }

      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      router.refresh();
    });
  };

  const badgeLabel = unreadCount > 99 ? "99+" : unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Open notifications"
        className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground outline-hidden hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 border-2 border-background bg-[#f04444] px-1 text-[10px] leading-none text-white"
          >
            {badgeLabel}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)]">
        <PopoverHeader className="flex-row items-center justify-between gap-2 px-1 py-0.5">
          <PopoverTitle>Notifications</PopoverTitle>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
              disabled={isPending}
              onClick={markAllRead}
            >
              Mark all as read
            </button>
          ) : null}
        </PopoverHeader>

        {error ? <p className="px-1 text-xs text-destructive">{error}</p> : null}

        {notifications.length === 0 ? (
          <div className="px-1 py-5 text-center text-sm text-muted-foreground">
            <p>No notifications yet</p>
            <p className="mt-1 text-xs">Client activity will appear here.</p>
          </div>
        ) : (
          <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  href={notification.href}
                  onClick={(event) => {
                    event.preventDefault();
                    markReadAndNavigate(notification);
                  }}
                  className="flex gap-2 rounded-xl px-2 py-2.5 text-sm hover:bg-muted"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read ? "bg-transparent" : "bg-primary"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-medium text-foreground">{notification.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </span>
                    {notification.body ? (
                      <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
