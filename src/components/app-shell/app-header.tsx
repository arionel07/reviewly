import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/app-shell/notification-bell";

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
}: {
  notifications: NotificationItem[];
  unreadNotificationCount: number;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-5 lg:px-8">
      <SidebarTrigger />
      <div className="ml-auto">
        <NotificationBell
          initialNotifications={notifications}
          initialUnreadCount={unreadNotificationCount}
        />
      </div>
    </header>
  );
}
