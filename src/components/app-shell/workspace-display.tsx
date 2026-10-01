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
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
        <Building2 className="size-3.5" />
      </span>
      <span className="truncate font-medium text-sidebar-foreground">
        {activeWorkspace?.name ?? "No workspace"}
      </span>
    </div>
  );
}
