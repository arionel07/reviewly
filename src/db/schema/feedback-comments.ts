import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { feedback } from "./feedback";

export const feedbackComments = pgTable(
  "feedback_comment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name"),
    authorEmail: text("author_email"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("feedback_comment_feedback_id_idx").on(table.feedbackId),
    index("feedback_comment_author_user_id_idx").on(table.authorUserId),
  ],
);

export const feedbackCommentsRelations = relations(
  feedbackComments,
  ({ one }) => ({
    feedback: one(feedback, {
      fields: [feedbackComments.feedbackId],
      references: [feedback.id],
    }),
    author: one(user, {
      fields: [feedbackComments.authorUserId],
      references: [user.id],
    }),
  }),
);
