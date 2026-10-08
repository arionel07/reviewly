import { Building2 } from "lucide-react";

/**
 * Shows the active workspace. `organizations` is accepted (even though only
 * the active one is rendered today) so a future workspace switcher can
 * replace the static row below with a dropdown without changing how this
 * component is called or where its data comes from.
 */
export function WorkspaceDisplay({
  activeWorkspace,
}: {
  activeWorkspace: { name: string } | null;
  organizations?: { id: string; name: string }[];
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-sidebar-border bg-background px-2 py-1.5 text-xs">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#d9ecff] text-[#0875d1]">
        <Building2 className="size-3" />
      </span>
      <span className="truncate font-medium text-sidebar-foreground">
        {activeWorkspace?.name ?? "No workspace"}
      </span>
    </div>
  );
}
