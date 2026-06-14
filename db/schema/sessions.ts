import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sessionModalityEnum, sessionStatusEnum, sessionTypeEnum } from "./enums";
import { clients } from "./clients";
import { organizations } from "./organizations";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id:              uuid("id").primaryKey().defaultRandom(),
  organizationId:  uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  clientId:        uuid("client_id").notNull().references(() => clients.id, { onDelete: "restrict" }),
  therapistId:     uuid("therapist_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  sessionType:     sessionTypeEnum("session_type").notNull().default("individual"),
  modality:        sessionModalityEnum("modality").notNull().default("in_person"),
  status:          sessionStatusEnum("status").notNull().default("scheduled"),
  scheduledAt:     timestamp("scheduled_at", { withTimezone: true }).notNull(),
  startedAt:       timestamp("started_at", { withTimezone: true }),
  endedAt:         timestamp("ended_at", { withTimezone: true }),
  durationMinutes: integer("duration_minutes"),
  cptCode:         varchar("cpt_code", { length: 10 }),
  sessionNumber:   integer("session_number"),
  keyVersion:      integer("key_version").notNull().default(1),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index("idx_sessions_org").on(t.organizationId),
  index("idx_sessions_client").on(t.clientId),
  index("idx_sessions_therapist").on(t.therapistId, t.scheduledAt),
]);

export type Session    = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
