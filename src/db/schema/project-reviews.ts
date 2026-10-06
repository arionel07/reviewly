import { relations, sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { projectReviewStatusEnum } from "./enums";
import { projects } from "./projects";

export const projectReviews = pgTable(
  "project_review",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: projectReviewStatusEnum("status").notNull(),
    requestedAt: timestamp("requested_at").notNull(),
    decidedAt: timestamp("decided_at"),
    decisionNote: text("decision_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("project_review_project_id_idx").on(table.projectId),
    index("project_review_project_requested_at_idx").on(table.projectId, table.requestedAt),
    uniqueIndex("project_review_one_pending_project_idx")
      .on(table.projectId)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export const projectReviewsRelations = relations(projectReviews, ({ one }) => ({
  project: one(projects, {
    fields: [projectReviews.projectId],
    references: [projects.id],
  }),
}));
