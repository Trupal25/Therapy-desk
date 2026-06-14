-- =============================================================================
-- TherapyDesk — DB-level security layer
-- Run this AFTER drizzle-kit migrate (it adds policies/triggers on top).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enable pgcrypto (needed for gen_random_uuid fallback if not on PG 13+)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 2. Row-Level Security — tenant isolation
--    The application sets `app.current_org_id` at the start of every request:
--      await db.execute(sql`SELECT set_config('app.current_org_id', ${orgId}, true)`)
-- ---------------------------------------------------------------------------

ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations    FORCE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            FORCE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys  ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys  FORCE ROW LEVEL SECURITY;
ALTER TABLE clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients          FORCE ROW LEVEL SECURITY;
ALTER TABLE client_consents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_consents  FORCE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         FORCE ROW LEVEL SECURITY;
ALTER TABLE session_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes    FORCE ROW LEVEL SECURITY;
ALTER TABLE soap_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes       FORCE ROW LEVEL SECURITY;
ALTER TABLE session_files    ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_files    FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    FORCE ROW LEVEL SECURITY;

-- Helper to safely read the current org id (returns NULL if not set)
CREATE OR REPLACE FUNCTION current_org_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_org_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- RLS policies (USING = read filter, WITH CHECK = write filter)
DROP POLICY IF EXISTS org_isolation ON organizations;
DROP POLICY IF EXISTS org_isolation ON users;
DROP POLICY IF EXISTS org_isolation ON encryption_keys;
DROP POLICY IF EXISTS org_isolation ON clients;
DROP POLICY IF EXISTS org_isolation ON client_consents;
DROP POLICY IF EXISTS org_isolation ON sessions;
DROP POLICY IF EXISTS org_isolation ON session_notes;
DROP POLICY IF EXISTS org_isolation ON soap_notes;
DROP POLICY IF EXISTS org_isolation ON session_files;
DROP POLICY IF EXISTS org_isolation ON audit_logs;
DROP POLICY IF EXISTS org_isolation ON subscriptions;

CREATE POLICY org_isolation ON organizations
  USING (id = current_org_id());

CREATE POLICY org_isolation ON users
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON encryption_keys
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON clients
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON client_consents
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON sessions
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON session_notes
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON soap_notes
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON session_files
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

CREATE POLICY org_isolation ON audit_logs
  USING (organization_id = current_org_id());
  -- No WITH CHECK — inserts go through the app, not direct SQL

CREATE POLICY org_isolation ON subscriptions
  USING (organization_id = current_org_id())
  WITH CHECK (organization_id = current_org_id());

-- ---------------------------------------------------------------------------
-- 3. Append-only enforcement on audit_logs
--    Prevents UPDATE and DELETE even by the app role.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_logs_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only — UPDATE and DELETE are not permitted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;

CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();

CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();

-- ---------------------------------------------------------------------------
-- 4. Auto-update updated_at via trigger (belt-and-suspenders alongside Drizzle)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_updated_at ON organizations;
DROP TRIGGER IF EXISTS trg_updated_at ON users;
DROP TRIGGER IF EXISTS trg_updated_at ON clients;
DROP TRIGGER IF EXISTS trg_updated_at ON sessions;
DROP TRIGGER IF EXISTS trg_updated_at ON session_notes;
DROP TRIGGER IF EXISTS trg_updated_at ON soap_notes;
DROP TRIGGER IF EXISTS trg_updated_at ON subscriptions;

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON organizations    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON users            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON clients          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON sessions         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON session_notes    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON soap_notes       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON subscriptions    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
