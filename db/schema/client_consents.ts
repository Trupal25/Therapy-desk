import { inet, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { consentTypeEnum } from "./enums";
import { clients } from "./clients";
import { organizations } from "./organizations";

export const clientConsents = pgTable("client_consents", {
  id:             uuid("id").primaryKey().defaultRandom(),
  clientId:       uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  consentType:    consentTypeEnum("consent_type").notNull(),
  grantedAt:      timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt:      timestamp("revoked_at", { withTimezone: true }),
  documentUrl:    text("document_url"),
  ipAddress:      inet("ip_address"),
  signatureHash:  text("signature_hash"),
});

export type ClientConsent    = typeof clientConsents.$inferSelect;
export type NewClientConsent = typeof clientConsents.$inferInsert;
