-- [ZAK: GDPR čl.32] Invite-based onboarding — umjesto da svaki signup kreira novi tenant,
-- owner/hr poziva email, user se registrira, trigger automatski dodaje u pozvani tenant.

-- ── 1. Tablica ──
CREATE TABLE IF NOT EXISTS public.tenant_invitations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('owner','hr','znr_specialist','delegate','worker')),
  invited_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  accepted_at  TIMESTAMPTZ,
  accepted_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Samo jedan pending invite po (tenant, email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_invitations_pending_unique
  ON public.tenant_invitations (tenant_id, lower(email))
  WHERE accepted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email_pending
  ON public.tenant_invitations (lower(email))
  WHERE accepted_at IS NULL;

-- ── 2. RLS ──
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_invitations_select ON public.tenant_invitations;
CREATE POLICY tenant_invitations_select ON public.tenant_invitations
  FOR SELECT USING (tenant_id IN (SELECT public.auth_tenant_ids()));

DROP POLICY IF EXISTS tenant_invitations_delete ON public.tenant_invitations;
CREATE POLICY tenant_invitations_delete ON public.tenant_invitations
  FOR DELETE USING (
    accepted_at IS NULL
    AND tenant_id IN (
      SELECT tu.tenant_id FROM public.tenant_users tu
      WHERE tu.user_id = auth.uid() AND tu.role IN ('owner','hr')
    )
  );

-- INSERT/UPDATE samo kroz RPC (SECURITY DEFINER)

-- ── 3. RPC: invite_user_by_email ──
CREATE OR REPLACE FUNCTION public.invite_user_by_email(
  p_email TEXT,
  p_role  TEXT DEFAULT 'hr'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_tenant_id   UUID;
  v_caller_role TEXT;
  v_invite_id   UUID;
  v_existing    UUID;
  v_email       TEXT := lower(trim(p_email));
BEGIN
  IF v_email IS NULL OR v_email = '' OR position('@' in v_email) = 0 THEN
    RAISE EXCEPTION 'Neispravan email' USING ERRCODE = '22023';
  END IF;

  IF p_role NOT IN ('owner','hr','znr_specialist','delegate','worker') THEN
    RAISE EXCEPTION 'Neispravna uloga: %', p_role USING ERRCODE = '22023';
  END IF;

  SELECT tu.tenant_id, tu.role
    INTO v_tenant_id, v_caller_role
  FROM public.tenant_users tu
  WHERE tu.user_id = auth.uid()
    AND tu.is_external_specialist = false
  ORDER BY tu.created_at
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Niste član niti jednog tenanta' USING ERRCODE = '42501';
  END IF;

  IF v_caller_role NOT IN ('owner','hr') THEN
    RAISE EXCEPTION 'Samo vlasnik ili HR može pozivati korisnike' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_existing FROM auth.users WHERE lower(email) = v_email LIMIT 1;

  IF v_existing IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.tenant_users
      WHERE user_id = v_existing AND tenant_id = v_tenant_id
    ) THEN
      RAISE EXCEPTION 'Korisnik je već član ovog tenanta' USING ERRCODE = '23505';
    END IF;

    INSERT INTO public.tenant_users (user_id, tenant_id, role, is_external_specialist)
    VALUES (v_existing, v_tenant_id, p_role, false);

    RETURN jsonb_build_object(
      'status',    'added',
      'user_id',   v_existing,
      'tenant_id', v_tenant_id
    );
  END IF;

  DELETE FROM public.tenant_invitations
  WHERE tenant_id = v_tenant_id
    AND lower(email) = v_email
    AND accepted_at IS NULL;

  INSERT INTO public.tenant_invitations (tenant_id, email, role, invited_by)
  VALUES (v_tenant_id, v_email, p_role, auth.uid())
  RETURNING id INTO v_invite_id;

  RETURN jsonb_build_object(
    'status',     'invited',
    'invite_id',  v_invite_id,
    'tenant_id',  v_tenant_id,
    'expires_at', (now() + INTERVAL '14 days')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.invite_user_by_email(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invite_user_by_email(TEXT, TEXT) TO authenticated;

-- ── 4. Trigger na auth.users ──
CREATE OR REPLACE FUNCTION public.handle_signup_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_inv RECORD;
  v_email TEXT := lower(NEW.email);
BEGIN
  IF v_email IS NULL THEN RETURN NEW; END IF;

  FOR v_inv IN
    SELECT id, tenant_id, role
    FROM public.tenant_invitations
    WHERE lower(email) = v_email
      AND accepted_at IS NULL
      AND expires_at > now()
  LOOP
    INSERT INTO public.tenant_users (user_id, tenant_id, role, is_external_specialist)
    VALUES (NEW.id, v_inv.tenant_id, v_inv.role, false)
    ON CONFLICT (user_id, tenant_id) DO NOTHING;

    UPDATE public.tenant_invitations
       SET accepted_at = now(), accepted_by = NEW.id
     WHERE id = v_inv.id;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_handle_invitation ON auth.users;
CREATE TRIGGER on_auth_user_created_handle_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_signup_invitation();

-- ── 5. Helper: has_pending_invite (callable od anon) ──
CREATE OR REPLACE FUNCTION public.has_pending_invite(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_invitations
    WHERE lower(email) = lower(trim(p_email))
      AND accepted_at IS NULL
      AND expires_at > now()
  );
$$;

REVOKE ALL ON FUNCTION public.has_pending_invite(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_pending_invite(TEXT) TO anon, authenticated;

-- ── 6. View: tenant_members s emailom ──
CREATE OR REPLACE VIEW public.tenant_members_v AS
  SELECT
    tu.id,
    tu.tenant_id,
    tu.user_id,
    tu.role,
    tu.is_external_specialist,
    tu.created_at,
    u.email AS user_email
  FROM public.tenant_users tu
  JOIN auth.users u ON u.id = tu.user_id;

GRANT SELECT ON public.tenant_members_v TO authenticated;
