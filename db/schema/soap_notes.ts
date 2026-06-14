import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { soapStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { sessionNotes } from "./session_notes";
import { sessions } from "./sessions";
import { users } from "./users";

export const soapNotes = pgTable("soap_notes", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  sessionId:            uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  sessionNoteId:        uuid("session_note_id").notNull().references(() => sessionNotes.id, { onDelete: "restrict" }),
  organizationId:       uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  therapistId:          uuid("therapist_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  subjectiveEnc:        text("subjective_enc").notNull(),
  objectiveEnc:         text("objective_enc").notNull(),
  assessmentEnc:        text("assessment_enc").notNull(),
  planEnc:              text("plan_enc").notNull(),
  generationModel:      text("generation_model"),
  generationDurationMs: integer("generation_duration_ms"),
  therapistEdited:      boolean("therapist_edited").notNull().default(false),
  editHistoryEnc:       text("edit_history_enc"),
  status:               soapStatusEnum("status").notNull().default("draft"),
  signedAt:             timestamp("signed_at", { withTimezone: true }),
  signedBy:             uuid("signed_by").references(() => users.id, { onDelete: "set null" }),
  keyVersion:           integer("key_version").notNull().default(1),
  contentHash:          text("content_hash").notNull(),
  createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index("idx_soap_org").on(t.organizationId),
  index("idx_soap_session").on(t.sessionId),
]);

export type SoapNote    = typeof soapNotes.$inferSelect;
export type NewSoapNote = typeof soapNotes.$inferInsert;
