import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const clients = pgTable("clients", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  organizationId:       uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  assignedTherapistId:  uuid("assigned_therapist_id").references(() => users.id, { onDelete: "set null" }),
  // Searchable HMAC hash of (firstName + lastName + dob + orgId) — no plaintext stored
  searchHash:           text("search_hash"),
  mrn:                  text("mrn"),                    // encrypted
  firstNameEnc:         text("first_name_enc").notNull(),
  lastNameEnc:          text("last_name_enc").notNull(),
  dateOfBirthEnc:       text("date_of_birth_enc").notNull(),
  emailEnc:             text("email_enc"),
  phoneEnc:             text("phone_enc"),
  gender:               text("gender"),
  pronouns:             text("pronouns"),
  diagnosisCodes:       text("diagnosis_codes").array().notNull().default([]),
  referralSource:       text("referral_source"),
  emergencyContactEnc:  text("emergency_contact_enc"),  // encrypted JSON
  insuranceInfoEnc:     text("insurance_info_enc"),     // encrypted JSON
  keyVersion:           integer("key_version").notNull().default(1),
  isActive:             boolean("is_active").notNull().default(true),
  createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
  deletedAt:            timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("idx_clients_org").on(t.organizationId),
  index("idx_clients_therapist").on(t.assignedTherapistId),
  index("idx_clients_search").on(t.searchHash, t.organizationId),
]);

export type Client    = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
