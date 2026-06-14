import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orgPlanEnum, subscriptionStatusEnum } from "./enums";
import { organizations } from "./organizations";

export const subscriptions = pgTable("subscriptions", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  organizationId:       uuid("organization_id").notNull().unique().references(() => organizations.id, { onDelete: "cascade" }),
  plan:                 orgPlanEnum("plan").notNull().default("free"),
  status:               subscriptionStatusEnum("status").notNull().default("trialing"),
  stripeCustomerId:     text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart:   timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd:     timestamp("current_period_end", { withTimezone: true }),
  soapNotesUsed:        integer("soap_notes_used").notNull().default(0),
  soapNotesLimit:       integer("soap_notes_limit").notNull().default(10),
  createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export type Subscription    = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
