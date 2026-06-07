CREATE TABLE public.first_timers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  heard_from    TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'following_up', 'converted')),
  assigned_to   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.first_timers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.first_timers FOR ALL
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER first_timers_updated_at
  BEFORE UPDATE ON public.first_timers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
