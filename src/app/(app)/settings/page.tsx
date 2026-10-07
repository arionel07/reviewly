import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWorkspace, requireWorkspace } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Settings — Reviewly",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { user, organizationId } = await requireWorkspace();
  const workspace = await getWorkspace(organizationId);
  const { tab } = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Workspace and account settings"
      />
        <Tabs defaultValue={tab === "account" ? "account" : "workspace"}>
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="workspace" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Workspace name</p>
            <p className="text-sm font-medium text-foreground">
              {workspace?.name ?? "Unknown workspace"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Workspace slug</p>
            <p className="text-sm font-medium text-foreground">
              {workspace?.slug ?? "—"}
            </p>
          </div>
        </TabsContent>
        <TabsContent value="account" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{user.email}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
