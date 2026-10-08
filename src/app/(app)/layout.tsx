import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getWorkspace, listWorkspaces, requireWorkspace } from "@/lib/auth/session";
import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/notifications/queries";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Authoritative, server-side guard: redirects unauthenticated visitors to
  // /sign-in and authenticated-but-workspace-less visitors to /onboarding.
  const { user, organizationId } = await requireWorkspace();

  const [activeWorkspace, organizations, notifications, unreadNotificationCount] = await Promise.all([
    getWorkspace(organizationId),
    listWorkspaces(),
    listNotifications(organizationId, user.id),
    getUnreadNotificationCount(organizationId, user.id),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
        activeWorkspace={activeWorkspace}
        organizations={organizations.map((organization) => ({
          id: organization.id,
          name: organization.name,
        }))}
        user={{ name: user.name, email: user.email }}
      />
      <SidebarInset>
        <AppHeader
          notifications={notifications.map((notification) => ({
            ...notification,
            createdAt: notification.createdAt.toISOString(),
          }))}
          unreadNotificationCount={unreadNotificationCount}
          user={{ name: user.name, email: user.email }}
        />
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 p-5 pt-14 sm:p-7 sm:pt-14 lg:p-5 lg:pt-14">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
