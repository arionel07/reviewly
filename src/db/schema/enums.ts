import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "completed",
  "archived",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "open",
  "in_progress",
  "resolved",
  "reopened",
]);

export const projectReviewStatusEnum = pgEnum("project_review_status", [
  "pending",
  "changes_requested",
  "approved",
]);
