import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user, organization } from "./auth";
import { feedback } from "./feedback";
import { notificationTypeEnum } from "./enums";
import { projectReviews } from "./project-reviews";
import { projects } from "./projects";

export const notifications = pgTable(
  "notification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    feedbackId: uuid("feedback_id").references(() => feedback.id, { onDelete: "cascade" }),
    projectReviewId: uuid("project_review_id").references(() => projectReviews.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    body: text("body"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_organization_created_at_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("notification_project_id_idx").on(table.projectId),
    index("notification_feedback_id_idx").on(table.feedbackId),
    index("notification_project_review_id_idx").on(table.projectReviewId),
  ],
);

export const notificationReads = pgTable(
  "notification_read",
  {
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.notificationId, table.userId] }),
    index("notification_read_user_id_idx").on(table.userId),
  ],
);

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  organization: one(organization, {
    fields: [notifications.organizationId],
    references: [organization.id],
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
  feedback: one(feedback, {
    fields: [notifications.feedbackId],
    references: [feedback.id],
  }),
  projectReview: one(projectReviews, {
    fields: [notifications.projectReviewId],
    references: [projectReviews.id],
  }),
  reads: many(notificationReads),
}));

export const notificationReadsRelations = relations(notificationReads, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationReads.notificationId],
    references: [notifications.id],
  }),
  user: one(user, {
    fields: [notificationReads.userId],
    references: [user.id],
  }),
}));
