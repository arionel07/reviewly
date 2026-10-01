import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { projects } from "./projects";

export const clients = pgTable(
  "client",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("client_owner_id_idx").on(table.ownerId)],
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  owner: one(user, {
    fields: [clients.ownerId],
    references: [user.id],
  }),
  projects: many(projects),
}));
