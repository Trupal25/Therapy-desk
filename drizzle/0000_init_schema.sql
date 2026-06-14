CREATE TYPE "public"."audit_event_type" AS ENUM('read', 'create', 'update', 'delete', 'export', 'login', 'logout', 'key_rotation', 'consent_change');--> statement-breakpoint
CREATE TYPE "public"."consent_type" AS ENUM('treatment', 'hipaa_notice', 'telehealth', 'recording', 'ai_processing');--> statement-breakpoint
CREATE TYPE "public"."enc_algorithm" AS ENUM('AES-256-GCM');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('audio', 'video', 'document', 'image');--> statement-breakpoint
CREATE TYPE "public"."org_plan" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('client', 'session', 'soap_note', 'session_note', 'session_file', 'user', 'organization');--> statement-breakpoint
CREATE TYPE "public"."session_modality" AS ENUM('in_person', 'telehealth', 'phone');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('individual', 'group', 'couples', 'family');--> statement-breakpoint
CREATE TYPE "public"."soap_status" AS ENUM('draft', 'reviewed', 'signed', 'amended');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'cancelled', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."transcription_status" AS ENUM('pending', 'processing', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'therapist', 'readonly');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" "org_plan" DEFAULT 'free' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"full_name" text NOT NULL,
	"role" "user_role" DEFAULT 'therapist' NOT NULL,
	"license_number_enc" text,
	"license_state" char(2),
	"specializations" text[] DEFAULT '{}' NOT NULL,
	"avatar_url" text,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "encryption_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"key_version" integer DEFAULT 1 NOT NULL,
	"wrapped_key" text,
	"algorithm" "enc_algorithm" DEFAULT 'AES-256-GCM' NOT NULL,
	"kms_key_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rotated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	CONSTRAINT "encryption_keys_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"assigned_therapist_id" uuid,
	"search_hash" text,
	"mrn" text,
	"first_name_enc" text NOT NULL,
	"last_name_enc" text NOT NULL,
	"date_of_birth_enc" text NOT NULL,
	"email_enc" text,
	"phone_enc" text,
	"gender" text,
	"pronouns" text,
	"diagnosis_codes" text[] DEFAULT '{}' NOT NULL,
	"referral_source" text,
	"emergency_contact_enc" text,
	"insurance_info_enc" text,
	"key_version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "client_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"consent_type" "consent_type" NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"document_url" text,
	"ip_address" "inet",
	"signature_hash" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"therapist_id" uuid NOT NULL,
	"session_type" "session_type" DEFAULT 'individual' NOT NULL,
	"modality" "session_modality" DEFAULT 'in_person' NOT NULL,
	"status" "session_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"duration_minutes" integer,
	"cpt_code" varchar(10),
	"session_number" integer,
	"key_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"therapist_id" uuid NOT NULL,
	"content_enc" text NOT NULL,
	"content_hash" text NOT NULL,
	"word_count" integer,
	"key_version" integer DEFAULT 1 NOT NULL,
	"ai_consent_verified" boolean DEFAULT false NOT NULL,
	"finalized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_notes_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "soap_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"session_note_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"therapist_id" uuid NOT NULL,
	"subjective_enc" text NOT NULL,
	"objective_enc" text NOT NULL,
	"assessment_enc" text NOT NULL,
	"plan_enc" text NOT NULL,
	"generation_model" text,
	"generation_duration_ms" integer,
	"therapist_edited" boolean DEFAULT false NOT NULL,
	"edit_history_enc" text,
	"status" "soap_status" DEFAULT 'draft' NOT NULL,
	"signed_at" timestamp with time zone,
	"signed_by" uuid,
	"key_version" integer DEFAULT 1 NOT NULL,
	"content_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"uploader_id" uuid,
	"file_type" "file_type" NOT NULL,
	"storage_key" text NOT NULL,
	"file_size_bytes" bigint,
	"mime_type" text,
	"transcription_status" "transcription_status" DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_ip" "inet",
	"actor_user_agent" text,
	"event_type" "audit_event_type" NOT NULL,
	"resource_type" "resource_type",
	"resource_id" uuid,
	"old_value_hash" text,
	"new_value_hash" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan" "org_plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"soap_notes_used" integer DEFAULT 0 NOT NULL,
	"soap_notes_limit" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encryption_keys" ADD CONSTRAINT "encryption_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_assigned_therapist_id_users_id_fk" FOREIGN KEY ("assigned_therapist_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_consents" ADD CONSTRAINT "client_consents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_consents" ADD CONSTRAINT "client_consents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_therapist_id_users_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_therapist_id_users_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_session_note_id_session_notes_id_fk" FOREIGN KEY ("session_note_id") REFERENCES "public"."session_notes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_therapist_id_users_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_signed_by_users_id_fk" FOREIGN KEY ("signed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_files" ADD CONSTRAINT "session_files_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_files" ADD CONSTRAINT "session_files_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_files" ADD CONSTRAINT "session_files_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_orgs_slug" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_users_org" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_clients_org" ON "clients" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_clients_therapist" ON "clients" USING btree ("assigned_therapist_id");--> statement-breakpoint
CREATE INDEX "idx_clients_search" ON "clients" USING btree ("search_hash","organization_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_org" ON "sessions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_client" ON "sessions" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_therapist" ON "sessions" USING btree ("therapist_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_session_notes_org" ON "session_notes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_soap_org" ON "soap_notes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_soap_session" ON "soap_notes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_audit_org_time" ON "audit_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_actor" ON "audit_logs" USING btree ("actor_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_resource" ON "audit_logs" USING btree ("resource_type","resource_id");