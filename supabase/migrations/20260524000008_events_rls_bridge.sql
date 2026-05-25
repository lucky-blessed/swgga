-- DEV BRIDGE — remove in Week 6 when Supabase Auth is wired
-- Allows server-side anon key reads for events queries

CREATE POLICY "events_write_bridge"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "events_update_bridge"
  ON public.events FOR UPDATE
  USING (auth.uid() IS NULL);

CREATE POLICY "events_delete_bridge"
  ON public.events FOR DELETE
  USING (auth.uid() IS NULL);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_registrations_read_bridge"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "event_registrations_write_bridge"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "event_registrations_update_bridge"
  ON public.event_registrations FOR UPDATE
  USING (auth.uid() IS NULL);
