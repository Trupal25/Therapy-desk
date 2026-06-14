import { boolean, char, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";
import { organizations } from "./organizations";

export const users = pgTable("users", {
  id:               uuid("id").primaryKey().defaultRandom(),
  organizationId:   uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  email:            text("email").notNull().unique(),
  passwordHash:     text("password_hash").notNull(),
  emailVerifiedAt:  timestamp("email_verified_at", { withTimezone: true }),
  fullName:         text("full_name").notNull(),
  role:             userRoleEnum("role").notNull().default("therapist"),
  licenseNumberEnc: text("license_number_enc"),
  licenseState:     char("license_state", { length: 2 }),
  specializations:  text("specializations").array().notNull().default([]),
  avatarUrl:        text("avatar_url"),
  mfaEnabled:       boolean("mfa_enabled").notNull().default(false),
  lastLoginAt:      timestamp("last_login_at", { withTimezone: true }),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
  deletedAt:        timestamp("deleted_at", { withTimezone: true }),
}, (t) => [index("idx_users_org").on(t.organizationId)]);

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
