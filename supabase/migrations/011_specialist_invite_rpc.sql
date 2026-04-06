-- ============================================================
-- ZNR ERP — 011_specialist_invite_rpc.sql
-- Sprint 011: ZNR stručnjak invite + accept flow
-- ============================================================

-- Invite: klijent poziva stručnjaka putem emaila
CREATE OR REPLACE FUNCTION invite_znr_specialist(
  p_specialist_email TEXT,
  p_tenant_id UUID
)
RETURNS znr_specialist_clients
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_spec_user_id UUID;
  v_tenant_name TEXT;
  v_result znr_specialist_clients;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF auth_tenant_role(p_tenant_id) NOT IN ('owner', 'hr') THEN
    RAISE EXCEPTION 'Nemate pravo pozivanja stručnjaka';
  END IF;

  SELECT id INTO v_spec_user_id FROM auth.users WHERE email = p_specialist_email;
  IF v_spec_user_id IS NULL THEN
    RAISE EXCEPTION 'Korisnik s emailom % nije pronađen u sustavu', p_specialist_email;
  END IF;

  SELECT name INTO v_tenant_name FROM tenants WHERE id = p_tenant_id;

  INSERT INTO znr_specialist_clients (specialist_user_id, tenant_id, tenant_name, status)
  VALUES (v_spec_user_id, p_tenant_id, v_tenant_name, 'pending')
  ON CONFLICT (specialist_user_id, tenant_id) DO UPDATE SET status = 'pending'
  RETURNING * INTO v_result;

  INSERT INTO tenant_users (user_id, tenant_id, role, is_external_specialist)
  VALUES (v_spec_user_id, p_tenant_id, 'znr_specialist', true)
  ON CONFLICT (user_id, tenant_id) DO NOTHING;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION invite_znr_specialist(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION invite_znr_specialist(TEXT, UUID) TO authenticated;

-- Accept: stručnjak prihvaća pozivnicu
CREATE OR REPLACE FUNCTION accept_specialist_invite(p_invite_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE znr_specialist_clients
  SET status = 'active', accepted_at = now()
  WHERE id = p_invite_id AND specialist_user_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pozivnica nije pronađena ili nije valjana';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION accept_specialist_invite(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION accept_specialist_invite(UUID) TO authenticated;
