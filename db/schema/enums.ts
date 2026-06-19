import { pgEnum } from "drizzle-orm/pg-core";

export const orgPlanEnum             = pgEnum("org_plan",             ["free", "pro", "enterprise"]);
export const userRoleEnum            = pgEnum("user_role",            ["owner", "admin", "therapist", "readonly"]);
export const sessionTypeEnum         = pgEnum("session_type",         ["individual", "group", "couples", "family", "cbt", "anxiety", "trauma", "depression", "general"]);
export const sessionModalityEnum     = pgEnum("session_modality",     ["in_person", "telehealth", "phone"]);
export const sessionStatusEnum       = pgEnum("session_status",       ["scheduled", "in_progress", "completed", "cancelled", "no_show"]);
export const consentTypeEnum         = pgEnum("consent_type",         ["treatment", "hipaa_notice", "telehealth", "recording", "ai_processing"]);
export const soapStatusEnum          = pgEnum("soap_status",          ["draft", "reviewed", "signed", "amended"]);
export const auditEventTypeEnum      = pgEnum("audit_event_type",     ["read", "create", "update", "delete", "export", "login", "logout", "key_rotation", "consent_change"]);
export const resourceTypeEnum        = pgEnum("resource_type",        ["client", "session", "soap_note", "session_note", "session_file", "user", "organization"]);
export const fileTypeEnum            = pgEnum("file_type",            ["audio", "video", "document", "image"]);
export const transcriptionStatusEnum = pgEnum("transcription_status", ["pending", "processing", "complete", "failed"]);
export const subscriptionStatusEnum  = pgEnum("subscription_status",  ["active", "past_due", "cancelled", "trialing"]);
export const encAlgorithmEnum        = pgEnum("enc_algorithm",        ["AES-256-GCM"]);
