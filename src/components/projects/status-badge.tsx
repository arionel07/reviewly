import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/projects/schemas";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_VARIANTS: Record<ProjectStatus, "secondary" | "default" | "outline"> = {
  draft: "secondary",
  active: "default",
  completed: "outline",
  archived: "outline",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
