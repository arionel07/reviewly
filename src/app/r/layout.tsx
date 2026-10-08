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
        <div className="mx-auto flex w-full max-w-3xl items-center px-5 py-5 sm:px-8">
          <span className="text-lg font-light tracking-[-0.03em] text-foreground">Reviewly</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-10 sm:px-8">
        {children}
      </main>
    </div>
  );
}
