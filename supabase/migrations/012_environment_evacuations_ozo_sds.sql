-- ============================================================
-- ZNR ERP — 012_environment_evacuations_ozo_sds.sql
-- M06 Radni okoliš, M07 OZO, M09 Evakuacija, M10 SDS
-- ============================================================
-- Vidi mcp__supabase__apply_migration('012_environment_tests_and_evacuations')
-- za puni SQL. Ovaj fajl je lokalna kopija za repo parity.

-- M06: environment_tests (fizikalni/kemijski) [ZAK: PR-05]
-- M07: ozo_records (osobna zaštitna oprema) [ZAK: PR-06 NN 5/21]
-- M09: evacuations (vježbe evakuacije) [ZAK: čl. 45 ZZnR]
-- M10: sds_documents (Safety Data Sheets)

-- Sve tablice imaju:
--   - tenant_id + RLS
--   - audit_log trigger
--   - updated_at trigger
--   - standardne CRUD politike (owner/hr/znr_specialist)
