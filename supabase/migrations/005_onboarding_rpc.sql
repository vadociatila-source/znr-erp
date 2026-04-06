-- ============================================================
-- ZNR ERP — 005_onboarding_rpc.sql
-- Sprint 002: Tenant Onboarding
-- ------------------------------------------------------------
-- Chicken-and-egg problem: authenticated user nema RLS prava
-- da INSERT-a u tenants ili tenant_users prije nego postane
-- član nekog tenanta. Rješenje: SECURITY DEFINER RPC koji
-- atomski kreira tenant + owner membership.
-- ============================================================

-- ── SLUG HELPER ──────────────────────────────────────────────
-- Pretvara naziv tvrtke u URL-safe slug. HR znakovi → ASCII.
-- Osigurava jedinstvenost dodavanjem -2, -3, ... ako već postoji.
CREATE OR REPLACE FUNCTION generate_tenant_slug(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_base   TEXT;
  v_slug   TEXT;
  v_suffix INT := 1;
BEGIN
  -- HR → ASCII
  v_base := lower(p_name);
  v_base := translate(v_base,
    'čćžšđČĆŽŠĐ',
    'cczsdcczsd');
  -- Non-alphanumeric → dash, trim dashes
  v_base := regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
  v_base := regexp_replace(v_base, '(^-+|-+$)', '', 'g');
  IF v_base = '' THEN v_base := 'tvrtka'; END IF;

  v_slug := v_base;
  WHILE EXISTS (SELECT 1 FROM tenants WHERE slug = v_slug) LOOP
    v_suffix := v_suffix + 1;
    v_slug := v_base || '-' || v_suffix::text;
  END LOOP;
  RETURN v_slug;
END;
$$;

-- ── CREATE TENANT WITH OWNER ─────────────────────────────────
-- Poziva se iz klijenta kroz rpc('create_tenant_with_owner', ...)
-- SECURITY DEFINER bypassa RLS — sigurno jer eksplicitno koristimo
-- auth.uid() kao ownera i validiramo ulaz.
CREATE OR REPLACE FUNCTION create_tenant_with_owner(
  p_name           TEXT,
  p_oib            TEXT DEFAULT NULL,
  p_industry       TEXT DEFAULT NULL,
  p_employee_count INTEGER DEFAULT 0,
  p_city           TEXT DEFAULT NULL,
  p_address        TEXT DEFAULT NULL
)
RETURNS tenants
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_slug    TEXT;
  v_plan    TEXT;
  v_tenant  tenants;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Naziv tvrtke je obavezan';
  END IF;

  IF p_employee_count < 0 THEN
    RAISE EXCEPTION 'Broj zaposlenika ne može biti negativan';
  END IF;

  -- OIB validacija: točno 11 znamenki ako je zadan
  IF p_oib IS NOT NULL AND btrim(p_oib) <> '' AND p_oib !~ '^[0-9]{11}$' THEN
    RAISE EXCEPTION 'OIB mora imati točno 11 znamenki';
  END IF;

  -- Auto-plan po broju zaposlenika (cjenik iz tenant.types.ts)
  v_plan := CASE
    WHEN p_employee_count <= 5  THEN 'micro'
    WHEN p_employee_count <= 20 THEN 'small'
    WHEN p_employee_count <= 50 THEN 'medium'
    ELSE 'large'
  END;

  v_slug := generate_tenant_slug(p_name);

  INSERT INTO tenants (name, slug, oib, plan, employee_count, industry, city, address, status)
  VALUES (
    btrim(p_name),
    v_slug,
    NULLIF(btrim(p_oib), ''),
    v_plan,
    p_employee_count,
    NULLIF(btrim(p_industry), ''),
    NULLIF(btrim(p_city), ''),
    NULLIF(btrim(p_address), ''),
    'trial'
  )
  RETURNING * INTO v_tenant;

  -- Dodjeljujemo pozivatelja kao ownera
  INSERT INTO tenant_users (user_id, tenant_id, role)
  VALUES (v_user_id, v_tenant.id, 'owner');

  RETURN v_tenant;
END;
$$;

-- Samo authenticated useri mogu pozvati RPC
REVOKE ALL ON FUNCTION create_tenant_with_owner(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_tenant_with_owner(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT) TO authenticated;
