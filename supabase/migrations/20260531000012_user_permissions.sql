-- Migration: Add user_permissions table for per-user RBAC overrides
-- Date: 2026-05-31
-- Description: Stores per-user permission grants/revocations by Senior Pastor or Super Admin

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission   text        NOT NULL,
  granted      boolean     NOT NULL DEFAULT true,
  granted_by   uuid        NOT NULL REFERENCES public.users(id),
  granted_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz,
  revoked_by   uuid        REFERENCES public.users(id),
  notes        text,
  UNIQUE (user_id, permission)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id
  ON public.user_permissions(user_id);

-- RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Only R01 and R02 can read/write user_permissions
CREATE POLICY "user_permissions_admin_only"
  ON public.user_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('R01', 'R02')
    )
  );

COMMENT ON TABLE public.user_permissions IS
'Per-user permission overrides. Grants or revokes specific capabilities
beyond what the user role provides by default. Managed by R01/R02 only.';
