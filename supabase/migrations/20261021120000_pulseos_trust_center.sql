-- PulseOS Trust Center / Integrity Engine: audit log, trust scores, anomalies.
-- Rows are written only by the `pulseos-trust-center` edge function (service role);
-- PulseOS admins may read everything and update anomaly status (investigation workflow).

CREATE TABLE IF NOT EXISTS pulseos_trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  owner_id text,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS pulseos_anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pulseos_trust_scores_risk ON pulseos_trust_scores (risk_level, score);
CREATE INDEX IF NOT EXISTS idx_pulseos_anomalies_queue ON pulseos_anomalies (status, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pulseos_anomalies_entity ON pulseos_anomalies (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_audit_log_timestamp ON pulseos_audit_log (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pulseos_audit_log_actor ON pulseos_audit_log (actor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pulseos_audit_log_entity ON pulseos_audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_audit_log_entity_key ON pulseos_audit_log ((metadata ->> 'entityKey'));

ALTER TABLE pulseos_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_read_trust_scores ON pulseos_trust_scores;
CREATE POLICY admin_read_trust_scores ON pulseos_trust_scores FOR SELECT TO authenticated
  USING (pulseos_is_admin());

DROP POLICY IF EXISTS admin_read_anomalies ON pulseos_anomalies;
CREATE POLICY admin_read_anomalies ON pulseos_anomalies FOR SELECT TO authenticated
  USING (pulseos_is_admin());

DROP POLICY IF EXISTS admin_update_anomalies ON pulseos_anomalies;
CREATE POLICY admin_update_anomalies ON pulseos_anomalies FOR UPDATE TO authenticated
  USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS admin_read_audit_log ON pulseos_audit_log;
CREATE POLICY admin_read_audit_log ON pulseos_audit_log FOR SELECT TO authenticated
  USING (pulseos_is_admin());
