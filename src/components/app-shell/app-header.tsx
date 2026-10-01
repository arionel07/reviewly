import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger />
    </header>
  );
}
