import { and, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { clients, feedback, projectReviews, projects } from "@/db/schema";
import { blockingFeedbackStatuses } from "@/lib/review/project-review";

export async function getDashboardOverview(organizationId: string) {
  const [projectRows, projectCount, clientCount, feedbackCount, pendingReviewCount] =
    await Promise.all([
      db
        .select({
          id: projects.id,
          name: projects.name,
          clientName: clients.name,
          status: projects.status,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .innerJoin(clients, eq(projects.clientId, clients.id))
        .where(eq(projects.organizationId, organizationId))
        .orderBy(desc(projects.updatedAt))
        .limit(5),
      db
        .select({ value: count() })
        .from(projects)
        .where(eq(projects.organizationId, organizationId)),
      db
        .select({ value: count() })
        .from(clients)
        .where(eq(clients.organizationId, organizationId)),
      db
        .select({ value: count() })
        .from(feedback)
        .innerJoin(projects, eq(feedback.projectId, projects.id))
        .where(
          and(
            eq(projects.organizationId, organizationId),
            inArray(feedback.status, blockingFeedbackStatuses),
          ),
        ),
      db
        .select({ value: count() })
        .from(projectReviews)
        .innerJoin(projects, eq(projectReviews.projectId, projects.id))
        .where(
          and(eq(projects.organizationId, organizationId), eq(projectReviews.status, "pending")),
        ),
    ]);

  const [projectTotal] = projectCount;
  const [clientTotal] = clientCount;
  const [feedbackTotal] = feedbackCount;
  const [pendingReviews] = pendingReviewCount;

  return {
    projects: projectRows,
    projectCount: Number(projectTotal?.value ?? 0),
    clientCount: Number(clientTotal?.value ?? 0),
    feedbackCount: Number(feedbackTotal?.value ?? 0),
    pendingReviewCount: Number(pendingReviews?.value ?? 0),
  };
}
