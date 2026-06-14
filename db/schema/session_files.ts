import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { fileTypeEnum, transcriptionStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { sessions } from "./sessions";
import { users } from "./users";

export const sessionFiles = pgTable("session_files", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  sessionId:            uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  organizationId:       uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  uploaderId:           uuid("uploader_id").references(() => users.id, { onDelete: "set null" }),
  fileType:             fileTypeEnum("file_type").notNull(),
  storageKey:           text("storage_key").notNull(), // S3/object-storage path (SSE-KMS encrypted at rest)
  fileSizeBytes:        bigint("file_size_bytes", { mode: "number" }),
  mimeType:             text("mime_type"),
  transcriptionStatus:  transcriptionStatusEnum("transcription_status").default("pending"),
  createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SessionFile    = typeof sessionFiles.$inferSelect;
export type NewSessionFile = typeof sessionFiles.$inferInsert;
