import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/app-shell/notification-bell";
import { UserMenu } from "@/components/app-shell/user-menu";

type NotificationItem = {
  id: string;
  type: "feedback_created" | "feedback_commented" | "feedback_reopened" | "review_changes_requested" | "review_approved";
  title: string;
  body: string | null;
  href: string;
  createdAt: string;
  read: boolean;
};

export function AppHeader({
  notifications,
  unreadNotificationCount,
  user,
}: {
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  user: { name: string; email: string };
}) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-14 shrink-0 items-center justify-between px-4 lg:px-5">
      <SidebarTrigger className="pointer-events-auto md:hidden" />
      <div className="pointer-events-auto ml-auto flex items-center gap-1">
        <NotificationBell
          initialNotifications={notifications}
          initialUnreadCount={unreadNotificationCount}
        />
        <UserMenu user={user} compact />
      </div>
    </header>
  );
}
