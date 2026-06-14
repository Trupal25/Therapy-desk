import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { encAlgorithmEnum } from "./enums";
import { organizations } from "./organizations";

export const encryptionKeys = pgTable("encryption_keys", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().unique().references(() => organizations.id, { onDelete: "cascade" }),
  keyVersion:     integer("key_version").notNull().default(1),
  // KMS-wrapped DEK — NULL while using HKDF+env-var mode. Populated when KMS is configured.
  wrappedKey:     text("wrapped_key"),
  algorithm:      encAlgorithmEnum("algorithm").notNull().default("AES-256-GCM"),
  kmsKeyId:       text("kms_key_id"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  rotatedAt:      timestamp("rotated_at", { withTimezone: true }),
  expiresAt:      timestamp("expires_at", { withTimezone: true }),
});

export type EncryptionKey    = typeof encryptionKeys.$inferSelect;
export type NewEncryptionKey = typeof encryptionKeys.$inferInsert;
