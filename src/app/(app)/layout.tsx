import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getWorkspace, listWorkspaces, requireWorkspace } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Authoritative, server-side guard: redirects unauthenticated visitors to
  // /sign-in and authenticated-but-workspace-less visitors to /onboarding.
  const { user, organizationId } = await requireWorkspace();

  const [activeWorkspace, organizations] = await Promise.all([
    getWorkspace(organizationId),
    listWorkspaces(),
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
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
