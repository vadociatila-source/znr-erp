-- ============================================================
-- ZNR ERP — 007_workers_import_prep.sql
-- Relax workers constraints za externe data importe + dodaj kontakt polja
--
-- Context: Import djelatnika iz Carta ERP CSV-a pokazao je da su OIB i
-- hire_date u mnogim starim HR sustavima nekompletni. Strict NOT NULL
-- bi blokirao legitimne importe.
--
-- [ZAK: čl. 61 ZZnR] Evidencija radnika ostaje trajna.
-- [ZAK: čl. 62 ZZnR] OIB je DE FACTO obavezan za HZZO prijave,
-- ali to je validacija domene, ne baze. UI / Akcijski centar pokazuje
-- upozorenje za djelatnike bez OIB-a.
-- ============================================================

ALTER TABLE workers ALTER COLUMN oib DROP NOT NULL;
ALTER TABLE workers ALTER COLUMN employment_date DROP NOT NULL;

-- Kontakt polja — potrebna za:
--   - M03 digital signature osposobljavanja (email link "Potvrđujem")
--   - M08 ozljeda flow — kontakt za 48h HZZO prijavu
--   - M04 podsjetnici za zdravstvene preglede
ALTER TABLE workers ADD COLUMN email TEXT;
ALTER TABLE workers ADD COLUMN phone TEXT;

-- Indeks za buduće upozorenje "djelatnici s nepotpunim podacima"
CREATE INDEX idx_workers_incomplete_data
  ON workers(tenant_id)
  WHERE oib IS NULL OR employment_date IS NULL;
