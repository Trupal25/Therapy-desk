import { index, inet, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { auditEventTypeEnum, resourceTypeEnum } from "./enums";
import { organizations } from "./organizations";

// Append-only — enforced by a Postgres trigger in db/rls.sql (no UPDATE/DELETE allowed)
export const auditLogs = pgTable("audit_logs", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  actorId:        uuid("actor_id"),
  actorIp:        inet("actor_ip"),
  actorUserAgent: text("actor_user_agent"),
  eventType:      auditEventTypeEnum("event_type").notNull(),
  resourceType:   resourceTypeEnum("resource_type"),
  resourceId:     uuid("resource_id"),
  oldValueHash:   text("old_value_hash"),
  newValueHash:   text("new_value_hash"),
  metadata:       jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_audit_org_time").on(t.organizationId, t.createdAt),
  index("idx_audit_actor").on(t.actorId, t.createdAt),
  index("idx_audit_resource").on(t.resourceType, t.resourceId),
]);

export type AuditLog    = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
