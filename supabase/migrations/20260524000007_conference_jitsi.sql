-- Add Jitsi Meet fields to conference_meetings
ALTER TABLE public.conference_meetings
  ADD COLUMN jitsi_room_id  TEXT UNIQUE,
  ADD COLUMN meeting_url    TEXT,
  ADD COLUMN notes          TEXT;

-- Add left_at to conference_participants
ALTER TABLE public.conference_participants
  ADD COLUMN left_at        TIMESTAMPTZ,
  ADD COLUMN sms_sent       BOOLEAN DEFAULT false;

-- RLS bridge for conference tables
ALTER TABLE public.conference_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conference_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conference_meetings_bridge"
  ON public.conference_meetings FOR ALL
  USING (auth.uid() IS NULL)
  WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "conference_participants_bridge"
  ON public.conference_participants FOR ALL
  USING (auth.uid() IS NULL)
  WITH CHECK (auth.uid() IS NULL);
