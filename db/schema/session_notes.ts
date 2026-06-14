import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { sessions } from "./sessions";
import { users } from "./users";

export const sessionNotes = pgTable("session_notes", {
  id:                 uuid("id").primaryKey().defaultRandom(),
  sessionId:          uuid("session_id").notNull().unique().references(() => sessions.id, { onDelete: "cascade" }),
  organizationId:     uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  therapistId:        uuid("therapist_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  contentEnc:         text("content_enc").notNull(),   // AES-256-GCM encrypted raw note
  contentHash:        text("content_hash").notNull(),  // HMAC-SHA256 for integrity
  wordCount:          integer("word_count"),
  keyVersion:         integer("key_version").notNull().default(1),
  aiConsentVerified:  boolean("ai_consent_verified").notNull().default(false),
  finalizedAt:        timestamp("finalized_at", { withTimezone: true }),
  createdAt:          timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:          timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [index("idx_session_notes_org").on(t.organizationId)]);

export type SessionNote    = typeof sessionNotes.$inferSelect;
export type NewSessionNote = typeof sessionNotes.$inferInsert;
