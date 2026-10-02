import Link from "next/link";

import { cn } from "@/lib/utils";
import { feedbackStatusValues, type FeedbackStatus } from "@/lib/feedback/status";

const FILTER_LABELS: Record<FeedbackStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  reopened: "Reopened",
};

/**
 * The review-portal counterpart to FeedbackStatusFilter, with links
 * rooted at /r/[token]/feedback instead of the authenticated
 * /projects/[projectId]/feedback — kept as its own small component
 * rather than parameterizing the dashboard one, since the two surfaces
 * intentionally never share a base path.
 */
export function ReviewStatusFilter({
  token,
  activeStatus,
}: {
  token: string;
  activeStatus?: FeedbackStatus;
}) {
  const filters: { label: string; href: string; isActive: boolean }[] = [
    {
      label: "All",
      href: `/r/${token}/feedback`,
      isActive: !activeStatus,
    },
    ...feedbackStatusValues.map((status) => ({
      label: FILTER_LABELS[status],
      href: `/r/${token}/feedback?status=${status}`,
      isActive: activeStatus === status,
    })),
  ];

  return (
    <nav aria-label="Filter feedback by status" className="flex flex-wrap gap-1">
      {filters.map((filter) => (
        <Link
          key={filter.label}
          href={filter.href}
          aria-current={filter.isActive ? "page" : undefined}
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-colors",
            filter.isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {filter.label}
        </Link>
      ))}
    </nav>
  );
}
