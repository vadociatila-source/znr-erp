-- ============================================================
-- ZNR ERP — 010_incidents.sql
-- [ZAK: čl. 62 ZZnR] Ozljede na radu — prijava HZZO u roku 48 sati
-- Kazna: 5.000–50.000 EUR za nepravovremenu prijavu
-- ============================================================

CREATE TABLE incidents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  worker_id           UUID NOT NULL REFERENCES workers(id),
  incident_date       TIMESTAMPTZ NOT NULL,
  report_deadline     TIMESTAMPTZ NOT NULL,
  description         TEXT NOT NULL,
  injury_type         TEXT,
  body_part           TEXT,
  location            TEXT,
  witnesses           TEXT,
  immediate_actions   TEXT,
  cause_analysis      TEXT,
  preventive_measures TEXT,
  hzzo_reported       BOOLEAN NOT NULL DEFAULT false,
  hzzo_reported_at    TIMESTAMPTZ,
  legal_ref_code      TEXT DEFAULT 'ZZnR-62-prijava-48h',
  status              TEXT NOT NULL DEFAULT 'reported'
                      CHECK (status IN ('reported','investigating','resolved')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          UUID,
  updated_by          UUID
);

CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_incidents_tenant ON incidents(tenant_id, status);
CREATE INDEX idx_incidents_worker ON incidents(worker_id);
CREATE INDEX idx_incidents_deadline ON incidents(tenant_id, report_deadline)
  WHERE NOT hzzo_reported;

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incidents_read" ON incidents
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));
CREATE POLICY "incidents_write" ON incidents
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner','hr','znr_specialist')
  );

CREATE TRIGGER audit_incidents
  AFTER INSERT OR UPDATE OR DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Auto-task: HITNO prijavi HZZO kad se ozljeda unese
CREATE OR REPLACE FUNCTION create_incident_task()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_worker_name TEXT;
BEGIN
  SELECT first_name || ' ' || last_name INTO v_worker_name
  FROM workers WHERE id = NEW.worker_id;

  INSERT INTO tasks (tenant_id, worker_id, title, description, due_date, legal_ref_code)
  VALUES (
    NEW.tenant_id,
    NEW.worker_id,
    'HITNO: Prijava ozljede HZZO — ' || COALESCE(v_worker_name, 'nepoznato'),
    'Ozljeda na radu mora biti prijavljena HZZO-u u roku 48 sati! Kazna: 5.000–50.000 EUR (čl. 62 ZZnR).',
    NEW.report_deadline::date,
    'ZZnR-62-prijava-48h'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_incident_task
  AFTER INSERT ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION create_incident_task();
