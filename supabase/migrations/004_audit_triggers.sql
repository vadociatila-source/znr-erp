-- ============================================================
-- ZNR ERP — 004_audit_triggers.sql
-- [ZAK: GDPR čl. 5(2)] Audit log na svim ZNR tablicama
-- ============================================================

CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Dohvati tenant_id iz retka (sve ZNR tablice ga imaju)
  IF TG_OP = 'DELETE' THEN
    v_tenant_id := OLD.tenant_id;
  ELSE
    v_tenant_id := NEW.tenant_id;
  END IF;

  INSERT INTO audit_log (tenant_id, table_name, record_id, action, old_data, new_data, user_id)
  VALUES (
    v_tenant_id,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000')
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Primijeni audit trigger na sve ZNR tablice
CREATE TRIGGER audit_workers
  AFTER INSERT OR UPDATE OR DELETE ON workers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_trainings
  AFTER INSERT OR UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_health_checks
  AFTER INSERT OR UPDATE ON health_checks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_equipment
  AFTER INSERT OR UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_work_positions
  AFTER INSERT OR UPDATE ON work_positions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
