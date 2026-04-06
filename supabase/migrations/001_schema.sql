-- ============================================================
-- ZNR ERP — 001_initial_schema.sql
-- Model 1: jedna baza, sve tvrtke, RLS izolacija po tenant_id
-- Pokrenuti u: jednom Supabase projektu na ZNR ERP accountu
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── TENANTS ──────────────────────────────────────────────────
-- Svaka tvrtka koja se registrira je jedan tenant
CREATE TABLE tenants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  oib            TEXT,
  plan           TEXT NOT NULL DEFAULT 'micro'
                 CHECK (plan IN ('micro','small','medium','large','znr_partner','znr_pro')),
  employee_count INTEGER NOT NULL DEFAULT 0,
  industry       TEXT,
  address        TEXT,
  city           TEXT,
  status         TEXT NOT NULL DEFAULT 'trial'
                 CHECK (status IN ('active','suspended','trial')),
  trial_ends_at  TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── TENANT_USERS ─────────────────────────────────────────────
-- Koji user ima pristup kojoj tvrtki s kojom ulogom
CREATE TABLE tenant_users (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role                   TEXT NOT NULL DEFAULT 'owner'
                         CHECK (role IN ('owner','hr','znr_specialist','delegate','worker')),
  is_external_specialist BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- ── ZNR_SPECIALIST_CLIENTS ───────────────────────────────────
-- Tip C: ZNR stručnjak vodi portfolio klijenata
CREATE TABLE znr_specialist_clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tenant_name         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('active','pending','revoked')),
  invited_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at         TIMESTAMPTZ,
  critical_count      INTEGER NOT NULL DEFAULT 0,
  urgent_count        INTEGER NOT NULL DEFAULT 0,
  UNIQUE(specialist_user_id, tenant_id)
);

-- ── LEGAL_REFERENCES ─────────────────────────────────────────
-- [ZAK] Globalna tablica — ista za sve tenante
-- ZZnR vrijedi za sve HR tvrtke, nema tenant_id ovdje
-- Ažuriraj samo ovdje kad se zakon promijeni — bez deplooya!
CREATE TABLE legal_references (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 TEXT UNIQUE NOT NULL,
  title                TEXT NOT NULL,
  article              TEXT,
  nn_number            TEXT,
  effective_date       DATE,
  description          TEXT,
  deadline_days        INTEGER,
  deadline_description TEXT,
  module_codes         TEXT[] NOT NULL DEFAULT '{}',
  is_active            BOOLEAN NOT NULL DEFAULT true,
  superseded_by        TEXT,
  last_verified        DATE DEFAULT CURRENT_DATE,
  source_url           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER legal_refs_updated_at BEFORE UPDATE ON legal_references
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_legal_refs_module ON legal_references USING GIN(module_codes);

-- ── AUDIT_LOG ────────────────────────────────────────────────
-- [ZAK: GDPR čl. 5(2)] Tko je kada što promijenio
CREATE TABLE audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  table_name TEXT NOT NULL,
  record_id  UUID NOT NULL,
  action     TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data   JSONB,
  new_data   JSONB,
  user_id    UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_tenant ON audit_log(tenant_id, created_at DESC);

-- ── WORKERS ──────────────────────────────────────────────────
-- [ZAK: čl. 61 ZZnR] Evidencija radnika — rok čuvanja: TRAJNO
-- NIKAD ne brisati — soft delete: status = 'former'
CREATE TABLE workers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id),  -- RLS izolacija!
  oib              TEXT NOT NULL,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  date_of_birth    DATE,
  gender           TEXT CHECK (gender IN ('M','F','other')),
  employment_date  DATE NOT NULL,
  -- [ZAK: čl. 27 ZZnR] employment_date = početak 30-dnevnog roka
  termination_date DATE,
  contract_type    TEXT CHECK (contract_type IN (
    'neodredjeno','odredjeno','student','vanjski','privremeni'
  )),
  position_id      UUID,
  department       TEXT,
  location         TEXT,
  is_special_conditions BOOLEAN DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','inactive','former')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       UUID,
  updated_by       UUID
);
CREATE TRIGGER workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_workers_tenant ON workers(tenant_id, status);
CREATE INDEX idx_workers_employment ON workers(tenant_id, employment_date);

-- ── WORK_POSITIONS ───────────────────────────────────────────
-- [ZAK: čl. 18 ZZnR] Radna mjesta i procjena rizika
CREATE TABLE work_positions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id),
  name                   TEXT NOT NULL,
  code                   TEXT,
  description            TEXT,
  is_special_conditions  BOOLEAN NOT NULL DEFAULT false,
  special_conditions_type TEXT[],
  hazards                TEXT[],
  protective_measures    TEXT[],
  residual_risk_level    TEXT CHECK (residual_risk_level IN ('low','medium','high')),
  risk_assessment_date   DATE,
  risk_assessment_next   DATE,
  -- [ZAK: čl. 18 ZZnR] revizija min. svake 2 godine
  department             TEXT,
  location               TEXT,
  status                 TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','inactive')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by             UUID,
  updated_by             UUID
);
CREATE TRIGGER work_positions_updated_at BEFORE UPDATE ON work_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_positions_tenant ON work_positions(tenant_id);

-- ── TRAININGS ────────────────────────────────────────────────
-- [ZAK: čl. 27 ZZnR + PR-02 NN 142/21] Osposobljavanja
CREATE TABLE trainings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id),
  worker_id        UUID NOT NULL REFERENCES workers(id),
  training_type    TEXT NOT NULL CHECK (training_type IN (
    'initial','refresher','position_change','fire_safety','first_aid','equipment','other'
  )),
  training_name    TEXT NOT NULL,
  legal_ref_code   TEXT,
  training_date    DATE NOT NULL,
  valid_until      DATE,
  provider         TEXT,
  location         TEXT,
  certificate_number TEXT,
  document_url     TEXT,
  digital_signature_at    TIMESTAMPTZ,
  digital_signature_token TEXT,
  status           TEXT NOT NULL DEFAULT 'valid'
                   CHECK (status IN ('valid','expiring_soon','expired')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       UUID,
  updated_by       UUID
);
CREATE TRIGGER trainings_updated_at BEFORE UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_trainings_tenant ON trainings(tenant_id);
CREATE INDEX idx_trainings_worker ON trainings(tenant_id, worker_id);
CREATE INDEX idx_trainings_expiry ON trainings(tenant_id, valid_until);

-- ── HEALTH_CHECKS ────────────────────────────────────────────
-- [ZAK: čl. 34 ZZnR] Zdravstveni pregledi
CREATE TABLE health_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  worker_id       UUID NOT NULL REFERENCES workers(id),
  check_type      TEXT NOT NULL CHECK (check_type IN (
    'prior','periodic','extraordinary'
  )),
  legal_ref_code  TEXT,
  check_date      DATE NOT NULL,
  next_check_date DATE,
  doctor_name     TEXT,
  institution     TEXT,
  result          TEXT NOT NULL CHECK (result IN (
    'fit','fit_with_restrictions','temporarily_unfit','unfit'
  )),
  restrictions    TEXT,
  document_url    TEXT,
  referral_url    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID,
  updated_by      UUID
);
CREATE TRIGGER health_checks_updated_at BEFORE UPDATE ON health_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_health_tenant ON health_checks(tenant_id);
CREATE INDEX idx_health_next_date ON health_checks(tenant_id, next_check_date);

-- ── EQUIPMENT ────────────────────────────────────────────────
-- [ZAK: PR-04 NN 16/16] Radna oprema + vatrogasni aparati
CREATE TABLE equipment (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),
  name                  TEXT NOT NULL,
  equipment_type        TEXT NOT NULL CHECK (equipment_type IN (
    'machine','fire_extinguisher','fire_protection',
    'pressure_vessel','lifting','electrical','vehicle','other'
  )),
  serial_number         TEXT,
  inventory_number      TEXT,
  manufacturer          TEXT,
  model                 TEXT,
  year_manufactured     INTEGER,
  location              TEXT,
  department            TEXT,
  has_increased_risk    BOOLEAN NOT NULL DEFAULT false,
  last_inspection_date  DATE,
  next_inspection_date  DATE,
  inspection_interval_days INTEGER,
  legal_ref_code        TEXT,
  inspection_document_url TEXT,
  qr_code_token         TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','out_of_service','disposed')),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by            UUID,
  updated_by            UUID
);
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_equipment_tenant ON equipment(tenant_id);
CREATE INDEX idx_equipment_next_inspection ON equipment(tenant_id, next_inspection_date);
CREATE INDEX idx_equipment_qr ON equipment(qr_code_token);
