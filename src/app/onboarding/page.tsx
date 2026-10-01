import type { Metadata } from "next";

import { redirectIfHasWorkspace } from "@/lib/auth/session";

import { CreateWorkspaceForm } from "./create-workspace-form";

export const metadata: Metadata = {
  title: "Create your workspace — Reviewly",
};

export default async function OnboardingPage() {
  await redirectIfHasWorkspace();

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
