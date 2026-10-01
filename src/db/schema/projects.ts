import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { organization } from "./auth";
import { clients } from "./clients";
import { projectStatusEnum } from "./enums";
import { feedback } from "./feedback";
import { reviewAccessTokens } from "./review-access-tokens";

export const projects = pgTable(
  "project",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    websiteUrl: text("website_url").notNull(),
    status: projectStatusEnum("status").default("draft").notNull(),
    publicKey: text("public_key").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("project_organization_id_idx").on(table.organizationId),
    index("project_client_id_idx").on(table.clientId),
  ],
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organization, {
    fields: [projects.organizationId],
    references: [organization.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  feedback: many(feedback),
  reviewAccessTokens: many(reviewAccessTokens),
}));
