import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "completed",
  "archived",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "open",
  "resolved",
  "approved",
  "reopened",
]);
