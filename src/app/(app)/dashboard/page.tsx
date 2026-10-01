import type { Metadata } from "next";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getWorkspace, requireWorkspace } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard — Reviewly",
};

export default async function DashboardPage() {
  const { user, organizationId } = await requireWorkspace();
  const workspace = await getWorkspace(organizationId);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-medium text-muted-foreground">Reviewly</p>
      <h1 className="text-xl font-semibold">
        Workspace: {workspace?.name ?? "Unknown workspace"}
      </h1>
      <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
      <SignOutButton />
    </div>
  );
}
