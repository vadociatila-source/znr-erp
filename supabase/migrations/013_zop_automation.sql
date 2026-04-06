-- ============================================================
-- ZNR ERP — 013_zop_automation.sql
-- Sprint 013: ZOP evidencije + automatizacija email narudžbi
--
-- [ZAK: Pr. NN 101/11] Vatrogasni aparati — ispravak rokova
-- [ZAK: ZoZP NN 92/10 čl.40] Stabilni ZOP sustavi — godišnje
-- ============================================================

-- 1) Ispravak rokova vatrogasnih aparata
-- Stari (netočni) kodovi deaktivirani:
UPDATE legal_references SET is_active = false
WHERE code IN ('ZOP-aparat-vizualni-1god', 'ZOP-aparat-servis-2god');

-- Novi ispravni rokovi + ZOP sustavi (9 novih referenci):
INSERT INTO legal_references (code, title, article, nn_number, effective_date, deadline_days, deadline_description, module_codes, is_active)
VALUES
  ('ZOP-VA-redovni-90d', 'Pravilnik o vatrogasnim aparatima', 'čl. 6', 'NN 101/11, 74/13', '2011-09-01',
   90, 'Redovni pregled svakih 90 dana — obavlja vlasnik/korisnik sam', ARRAY['M05'], true),
  ('ZOP-VA-servis-365d', 'Pravilnik o vatrogasnim aparatima', 'čl. 7', 'NN 101/11, 74/13', '2011-09-01',
   365, 'Periodički servis min. jednom godišnje — ovlašteni serviser', ARRAY['M05'], true),
  ('ZOP-VA-kontrolno-1825d', 'Pravilnik o vatrogasnim aparatima', 'čl. 13', 'NN 101/11, 74/13', '2011-09-01',
   1825, 'Kontrolno ispitivanje svake 5 godina — ovlaštena pravna osoba', ARRAY['M05'], true),
  ('ZOP-hidrant-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22', '2010-07-28',
   365, 'Ispitivanje hidrantske mreže min. jednom godišnje', ARRAY['M05'], true),
  ('ZOP-vatrodojava-365d', 'Pravilnik o provjeri ispravnosti stabilnih sustava', 'čl. 40 ZoZP', 'NN 44/12, 98/21, 89/22', '2012-04-01',
   365, 'Periodičko ispitivanje sustava vatrodojave min. jednom godišnje', ARRAY['M05'], true),
  ('ZOP-sprinkler-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22', '2010-07-28',
   365, 'Ispitivanje sprinkler/stabilnih sustava gašenja min. jednom godišnje', ARRAY['M05'], true),
  ('ZOP-co2-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22', '2010-07-28',
   365, 'Ispitivanje CO2/prah stabilnih sustava gašenja min. jednom godišnje', ARRAY['M05'], true),
  ('ZOP-sig-rasvjeta-365d', 'Zakon o zaštiti na radu', 'čl. 42', 'NN 71/14 + NN 5/10', '2014-07-26',
   365, 'Ispitivanje protupaničke/sigurnosne rasvjete jednom godišnje', ARRAY['M05'], true),
  ('ZOP-plin-detekcija-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22', '2010-07-28',
   365, 'Ispitivanje sustava detekcije zapaljivih plinova jednom godišnje', ARRAY['M05'], true)
ON CONFLICT (code) DO UPDATE SET
  deadline_days = EXCLUDED.deadline_days,
  deadline_description = EXCLUDED.deadline_description,
  is_active = true;

-- 2) Proširenje equipment tablice — vatrogasni aparati 3 roka
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS fire_ext_last_owner_check DATE,
  ADD COLUMN IF NOT EXISTS fire_ext_next_owner_check DATE,
  ADD COLUMN IF NOT EXISTS fire_ext_last_service DATE,
  ADD COLUMN IF NOT EXISTS fire_ext_next_service DATE,
  ADD COLUMN IF NOT EXISTS fire_ext_last_control_test DATE,
  ADD COLUMN IF NOT EXISTS fire_ext_next_control_test DATE;

-- 3) Tracking stupci za email automatizaciju (sprječava duplikate)
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS automation_email_sent_at TIMESTAMPTZ;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS automation_email_sent_for_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS automation_email_sent_at TIMESTAMPTZ;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS automation_email_sent_for_date DATE;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS automation_email_sent_at TIMESTAMPTZ;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS automation_email_sent_for_date DATE;
ALTER TABLE environment_tests ADD COLUMN IF NOT EXISTS automation_email_sent_at TIMESTAMPTZ;
ALTER TABLE environment_tests ADD COLUMN IF NOT EXISTS automation_email_sent_for_date DATE;
ALTER TABLE evacuations ADD COLUMN IF NOT EXISTS automation_email_sent_at TIMESTAMPTZ;
ALTER TABLE ozo_records ADD COLUMN IF NOT EXISTS automation_email_sent_at TIMESTAMPTZ;

-- 4) Automation settings tablica (per-tenant konfiguracija)
CREATE TABLE IF NOT EXISTS automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  health_check_enabled BOOLEAN DEFAULT true,
  health_check_advance_days INTEGER DEFAULT 14,
  health_check_recipient_medicine TEXT,
  health_check_recipient_hr TEXT,
  health_check_notify_worker BOOLEAN DEFAULT true,
  health_check_email_template TEXT,
  fire_ext_service_enabled BOOLEAN DEFAULT true,
  fire_ext_service_advance_days INTEGER DEFAULT 14,
  fire_ext_service_recipient_external TEXT,
  fire_ext_service_recipient_internal TEXT,
  fire_ext_quarterly_enabled BOOLEAN DEFAULT true,
  fire_ext_quarterly_advance_days INTEGER DEFAULT 7,
  fire_ext_quarterly_recipient_internal TEXT,
  fire_systems_enabled BOOLEAN DEFAULT true,
  fire_systems_advance_days INTEGER DEFAULT 30,
  fire_systems_recipient_external TEXT,
  fire_systems_recipient_internal TEXT,
  equipment_enabled BOOLEAN DEFAULT true,
  equipment_advance_days INTEGER DEFAULT 30,
  equipment_recipient_external TEXT,
  equipment_recipient_internal TEXT,
  training_enabled BOOLEAN DEFAULT true,
  training_advance_days INTEGER DEFAULT 30,
  training_notify_worker BOOLEAN DEFAULT true,
  training_recipient_hr TEXT,
  environment_enabled BOOLEAN DEFAULT true,
  environment_advance_days INTEGER DEFAULT 30,
  environment_recipient_external TEXT,
  environment_recipient_internal TEXT,
  ozo_enabled BOOLEAN DEFAULT true,
  ozo_advance_days INTEGER DEFAULT 30,
  ozo_notify_worker BOOLEAN DEFAULT true,
  ozo_recipient_hr TEXT,
  evacuation_enabled BOOLEAN DEFAULT true,
  evacuation_advance_days INTEGER DEFAULT 60,
  evacuation_recipient_internal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automation_settings_all" ON automation_settings
  FOR ALL USING (tenant_id IN (SELECT auth_tenant_ids()));

-- 5) Automation log (history poslanog)
CREATE TABLE IF NOT EXISTS automation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','pending'))
);

CREATE INDEX IF NOT EXISTS idx_automation_log_tenant ON automation_log(tenant_id, sent_at DESC);
ALTER TABLE automation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automation_log_read" ON automation_log
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));
