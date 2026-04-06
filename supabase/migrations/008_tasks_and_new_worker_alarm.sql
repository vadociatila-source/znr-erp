-- ============================================================
-- ZNR ERP — 008_tasks_and_new_worker_alarm.sql
-- [ZAK: čl. 27 ZZnR] Auto-alarm: novi djelatnik mora biti
-- osposobljen u roku 30 dana od zaposlenja.
--
-- tasks tablica služi kao centralni backlog za Akcijski centar
-- (Sprint 007). Trigger automatski kreira task čim se novi
-- djelatnik upiše u sustav.
-- ============================================================

CREATE TABLE tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id),
  worker_id      UUID REFERENCES workers(id),
  title          TEXT NOT NULL,
  description    TEXT,
  due_date       DATE,
  legal_ref_code TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','done','dismissed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_tasks_tenant ON tasks(tenant_id, status);
CREATE INDEX idx_tasks_worker ON tasks(worker_id);
CREATE INDEX idx_tasks_due ON tasks(tenant_id, due_date) WHERE status = 'pending';

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_read" ON tasks
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));

CREATE POLICY "tasks_write" ON tasks
  FOR ALL USING (
    tenant_id IN (SELECT auth_tenant_ids())
    AND auth_tenant_role(tenant_id) IN ('owner','hr','znr_specialist')
  );

-- Audit trigger
CREATE TRIGGER audit_tasks
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Auto-alarm trigger function
-- [ZAK: čl. 27 ZZnR] 30 dana od zaposlenja za osposobljavanje
CREATE OR REPLACE FUNCTION create_new_worker_training_task()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO tasks (tenant_id, worker_id, title, description, due_date, legal_ref_code)
  VALUES (
    NEW.tenant_id,
    NEW.id,
    'Osposobljavanje: ' || NEW.first_name || ' ' || NEW.last_name,
    'Novi djelatnik mora biti osposobljen za rad na siguran način u roku 30 dana od zaposlenja (čl. 27 ZZnR, NN 71/14).',
    COALESCE(NEW.employment_date, CURRENT_DATE) + INTERVAL '30 days',
    'ZZnR-27-novi-radnik-30d'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_worker_training_task
  AFTER INSERT ON workers
  FOR EACH ROW
  EXECUTE FUNCTION create_new_worker_training_task();
