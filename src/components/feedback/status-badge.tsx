import { Badge } from "@/components/ui/badge";
import type { FeedbackStatus } from "@/lib/feedback/status";

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  reopened: "Reopened",
};

const STATUS_VARIANTS: Record<FeedbackStatus, "secondary" | "default" | "outline" | "destructive"> = {
  open: "secondary",
  in_progress: "default",
  resolved: "outline",
  reopened: "destructive",
};

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
