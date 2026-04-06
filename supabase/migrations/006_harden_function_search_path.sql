-- ============================================================
-- ZNR ERP — 006_harden_function_search_path.sql
-- Security remediation za Supabase advisor lint 0011
-- (function_search_path_mutable)
--
-- Bez SET search_path, SECURITY DEFINER funkcije su ranjive na
-- search_path hijack napade: napadač može kreirati malicious
-- objekte u schemi koja dolazi prije `public` u search_pathu i
-- nadjačati standardne tablice/funkcije koje koristimo unutar
-- naših helper funkcija (auth_tenant_ids, audit_trigger_fn, itd).
--
-- Pinanjem na `public, pg_temp` osiguravamo da se naši identifikatori
-- uvijek rezolviraju protiv prave sheme, a pg_temp ostaje na kraju
-- radi standardnog Postgres temp-table ponašanja.
--
-- Primijenjeno i u produkciji kroz MCP apply_migration dana 2026-04-06.
-- ============================================================

ALTER FUNCTION public.update_updated_at()        SET search_path = public, pg_temp;
ALTER FUNCTION public.auth_tenant_ids()          SET search_path = public, pg_temp;
ALTER FUNCTION public.auth_tenant_role(UUID)     SET search_path = public, pg_temp;
ALTER FUNCTION public.audit_trigger_fn()         SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_tenant_slug(TEXT) SET search_path = public, pg_temp;
