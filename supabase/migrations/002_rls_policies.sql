-- ============================================================
-- ZNR ERP — 002_rls_policies.sql
-- Row Level Security — srce Model 1 multi-tenancy
-- Svaki authenticated user vidi SAMO podatke svoje tvrtke
-- ============================================================

-- ── HELPER FUNKCIJA ──────────────────────────────────────────
-- Vraća sve tenant_id-ove kojima autenticirani user ima pristup.
-- Koristi se u svim RLS politikama — jedan call, cache od Postgresa.
CREATE OR REPLACE FUNCTION auth_tenant_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
$$;

-- Vraća ulogu usera u specificnom tenantu
CREATE OR REPLACE FUNCTION auth_tenant_role(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM tenant_users
  WHERE user_id = auth.uid() AND tenant_id = p_tenant_id
  LIMIT 1
$$;

-- ── TENANTS ──────────────────────────────────────────────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_read_own" ON tenants
  FOR SELECT USING (id IN (SELECT auth_tenant_ids()));

-- Samo owner može ažurirati podatke tvrtke
CREATE POLICY "tenants_update_owner" ON tenants
  FOR UPDATE USING (
    id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(id) IN ('owner', 'hr')
  );

-- ── TENANT_USERS ─────────────────────────────────────────────
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Korisnik vidi sve članove svog tenanta
CREATE POLICY "tenant_users_read" ON tenant_users
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

-- Owner/HR može upravljati korisnicima
CREATE POLICY "tenant_users_manage" ON tenant_users
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner', 'hr')
  );

-- ── ZNR_SPECIALIST_CLIENTS ───────────────────────────────────
ALTER TABLE znr_specialist_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "specialist_own_clients" ON znr_specialist_clients
  FOR ALL USING (specialist_user_id = auth.uid());

CREATE POLICY "tenant_sees_specialists" ON znr_specialist_clients
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

-- ── LEGAL_REFERENCES ─────────────────────────────────────────
-- Globalna tablica — svi authenticated useri mogu čitati
-- Samo service_role može mijenjati (admin ažuriranje zakona)
ALTER TABLE legal_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "legal_refs_authenticated_read" ON legal_references
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── AUDIT_LOG ────────────────────────────────────────────────
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Owner/HR može čitati audit log svog tenanta
CREATE POLICY "audit_log_read" ON audit_log
  FOR SELECT USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner', 'hr', 'znr_specialist')
  );

CREATE POLICY "audit_log_insert" ON audit_log
  FOR INSERT WITH CHECK (tenant_id IN (SELECT auth_tenant_ids()));

-- ── WORKERS ──────────────────────────────────────────────────
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Svi member tenanta mogu čitati radnike
CREATE POLICY "workers_read" ON workers
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

-- Owner, HR, ZNR specialist mogu unositi/uređivati
CREATE POLICY "workers_write" ON workers
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner','hr','znr_specialist')
  );

-- ── WORK_POSITIONS ───────────────────────────────────────────
ALTER TABLE work_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "positions_read" ON work_positions
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

CREATE POLICY "positions_write" ON work_positions
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner','hr','znr_specialist')
  );

-- ── TRAININGS ────────────────────────────────────────────────
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainings_read" ON trainings
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

CREATE POLICY "trainings_write" ON trainings
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner','hr','znr_specialist')
  );

-- ── HEALTH_CHECKS ────────────────────────────────────────────
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_read" ON health_checks
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

CREATE POLICY "health_write" ON health_checks
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner','hr','znr_specialist')
  );

-- ── EQUIPMENT ────────────────────────────────────────────────
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment_read" ON equipment
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

CREATE POLICY "equipment_write" ON equipment
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner','hr','znr_specialist')
  );

-- ── PUBLIC QR READ (bez auth) ─────────────────────────────────
-- Inspektor skenira QR → vidi status opreme bez logina
-- Prikazuje samo: naziv, tip, status pregleda, rok — bez osobnih podataka
CREATE POLICY "equipment_public_qr" ON equipment
  FOR SELECT USING (qr_code_token IS NOT NULL);
-- Napomena: endpoint /qr/{token} prikazuje ograničene podatke,
-- implementirati kao Supabase Edge Function koja ne zahtijeva auth
