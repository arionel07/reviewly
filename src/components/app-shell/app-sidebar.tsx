import { FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNav, type SidebarNavItem } from "@/components/app-shell/sidebar-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { WorkspaceDisplay } from "@/components/app-shell/workspace-display";

const mainNavItems: SidebarNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/projects", label: "Projects", icon: <FolderKanban /> },
  { href: "/clients", label: "Clients", icon: <Users /> },
];

const secondaryNavItems: SidebarNavItem[] = [
  { href: "/settings", label: "Settings", icon: <Settings /> },
];

export function AppSidebar({
  activeWorkspace,
  organizations,
  user,
}: {
  activeWorkspace: { name: string } | null;
  organizations: { id: string; name: string }[];
  user: { name: string; email: string };
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center rounded-md px-2 py-1.5 text-sm font-semibold text-sidebar-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          Reviewly
        </Link>
        <WorkspaceDisplay
          activeWorkspace={activeWorkspace}
          organizations={organizations}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarNav items={mainNavItems} />
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarNav items={secondaryNavItems} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
