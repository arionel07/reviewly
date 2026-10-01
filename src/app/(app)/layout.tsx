import type { ReactNode } from "react";

import { requireWorkspace } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Authoritative, server-side guard: redirects unauthenticated visitors to
  // /sign-in and authenticated-but-workspace-less visitors to /onboarding.
  await requireWorkspace();

  return <div className="flex min-h-svh flex-1 flex-col">{children}</div>;
}
