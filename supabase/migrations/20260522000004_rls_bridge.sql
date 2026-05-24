-- DEV BRIDGE — remove in Week 6 when Supabase Auth is wired
-- Allows server-side anon key reads for dashboard queries

CREATE POLICY "giving_read_bridge"
  ON public.giving_transactions FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "prayer_read_bridge"
  ON public.prayer_requests FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "events_read_bridge"
  ON public.events FOR SELECT
  USING (auth.uid() IS NULL);
