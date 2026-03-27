-- =============================================================================
-- Migration 005: Client Management (Agency Tier)
-- =============================================================================

CREATE TABLE IF NOT EXISTS imm_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE imm_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency users can manage own clients"
  ON imm_clients
  USING (auth.uid() = agency_user_id)
  WITH CHECK (auth.uid() = agency_user_id);

ALTER TABLE imm_cases ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES imm_clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_imm_cases_client_id ON imm_cases(client_id);

CREATE OR REPLACE FUNCTION update_imm_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER imm_clients_updated_at
  BEFORE UPDATE ON imm_clients
  FOR EACH ROW EXECUTE FUNCTION update_imm_clients_updated_at();
