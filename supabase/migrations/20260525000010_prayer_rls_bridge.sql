-- DEV BRIDGE — remove in Week 6 when Supabase Auth is wired
CREATE POLICY "prayer_read_admin_bridge"
  ON public.prayer_requests FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "prayer_insert_bridge"
  ON public.prayer_requests FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "prayer_update_bridge"
  ON public.prayer_requests FOR UPDATE
  USING (auth.uid() IS NULL);
