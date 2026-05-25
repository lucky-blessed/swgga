-- RLS bridge for sermons table
-- Allows server-side anon key reads until Supabase Auth is wired in Week 6

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sermons_read_bridge"
  ON public.sermons FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "sermons_write_bridge"
  ON public.sermons FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "sermons_update_bridge"
  ON public.sermons FOR UPDATE
  USING (auth.uid() IS NULL);

CREATE POLICY "sermons_delete_bridge"
  ON public.sermons FOR DELETE
  USING (auth.uid() IS NULL);
