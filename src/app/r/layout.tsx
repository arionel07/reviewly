import type { ReactNode } from "react";

/**
 * The public review portal's own minimal shell — no sidebar, no
 * workspace switcher, none of the authenticated dashboard's chrome
 * (see AGENTS.md's "Client Portal Principles"). Deliberately not a
 * child of src/app/(app)/layout.tsx, which calls requireWorkspace and
 * would force a Better Auth session this surface must never require.
 */
export default function ReviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-2xl items-center px-4 py-4">
          <span className="text-sm font-semibold text-foreground">Reviewly</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
