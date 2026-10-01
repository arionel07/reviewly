import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { organization } from "./auth";
import { projects } from "./projects";

export const clients = pgTable(
  "client",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("client_organization_id_idx").on(table.organizationId)],
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organization, {
    fields: [clients.organizationId],
    references: [organization.id],
  }),
  projects: many(projects),
}));
