import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orgPlanEnum } from "./enums";

export const organizations = pgTable("organizations", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name").notNull(),
  slug:      text("slug").notNull().unique(),
  plan:      orgPlanEnum("plan").notNull().default("free"),
  settings:  jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [index("idx_orgs_slug").on(t.slug)]);

export type Organization    = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
