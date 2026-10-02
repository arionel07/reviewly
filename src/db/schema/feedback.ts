import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { feedbackComments } from "./feedback-comments";
import { feedbackStatusEnum } from "./enums";
import { projects } from "./projects";

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: feedbackStatusEnum("status").default("open").notNull(),
    pageUrl: text("page_url").notNull(),
    selector: text("selector"),
    elementText: text("element_text"),
    screenshotKey: text("screenshot_key"),
    viewportWidth: integer("viewport_width"),
    viewportHeight: integer("viewport_height"),
    userAgent: text("user_agent"),
    authorName: text("author_name"),
    authorEmail: text("author_email"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("feedback_project_id_idx").on(table.projectId),
    index("feedback_status_idx").on(table.status),
  ],
);

export const feedbackRelations = relations(feedback, ({ one, many }) => ({
  project: one(projects, {
    fields: [feedback.projectId],
    references: [projects.id],
  }),
  comments: many(feedbackComments),
}));
