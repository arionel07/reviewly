import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { projects } from "./projects";

export const reviewAccessTokens = pgTable(
  "review_access_token",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("review_access_token_project_id_idx").on(table.projectId)],
);

export const reviewAccessTokensRelations = relations(
  reviewAccessTokens,
  ({ one }) => ({
    project: one(projects, {
      fields: [reviewAccessTokens.projectId],
      references: [projects.id],
    }),
  }),
);
