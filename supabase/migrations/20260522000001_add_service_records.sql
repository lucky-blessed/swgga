-- Migration: add_service_records
-- Adds aggregate headcount table for Sunday and midweek services

CREATE TABLE public.service_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date   DATE NOT NULL,
  service_type   TEXT NOT NULL,       -- sunday_first | sunday_second | wednesday | special
  total_count    INTEGER NOT NULL,
  men_count      INTEGER,
  women_count    INTEGER,
  children_count INTEGER,
  first_timers   INTEGER DEFAULT 0,
  event_id       UUID REFERENCES public.events(id),
  notes          TEXT,
  recorded_by    UUID NOT NULL REFERENCES public.users(id),
  created_at     TIMESTAMPTZ DEFAULT now(),

  UNIQUE(service_date, service_type)
);

CREATE INDEX service_records_date_idx ON public.service_records(service_date DESC);