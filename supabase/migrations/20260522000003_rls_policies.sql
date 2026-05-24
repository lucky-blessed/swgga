-- Migration: rls_policies
-- Implements Row Level Security policies for all tables
-- as defined in SWGGA Security Architecture v2.0, Section 7
-- These policies work alongside proxy.ts RBAC (defence in depth)

-- ============================================================
-- HELPER: get current user's role from the JWT claim
-- Supabase Auth sets auth.jwt() from the session token
-- For server-side calls we use a custom claim set via
-- the Supabase client session context
-- ============================================================

-- We use a custom function to safely extract role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'R11'
  )
$$;

-- ============================================================
-- 1. USERS
-- Users can read/update only their own row.
-- R01, R02, R03 can read all rows.
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id
    OR public.user_role() IN ('R01', 'R02', 'R03')
  );

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_registration"
  ON public.users FOR INSERT
  WITH CHECK (true);  -- registration creates the row before auth exists


-- ============================================================
-- 2. MEMBERS
-- Members can read own row.
-- R01, R02, R03 can read all rows.
-- pastoral_notes: R01, R02 only (enforced at API level too)
-- ============================================================

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_own"
  ON public.members FOR SELECT
  USING (
    auth.uid() = id
    OR public.user_role() IN ('R01', 'R02', 'R03')
  );

CREATE POLICY "members_insert_admin"
  ON public.members FOR INSERT
  WITH CHECK (
    public.user_role() IN ('R01', 'R02', 'R03')
  );

CREATE POLICY "members_update_admin"
  ON public.members FOR UPDATE
  USING (
    auth.uid() = id
    OR public.user_role() IN ('R01', 'R02', 'R03')
  );


-- ============================================================
-- 3. MINISTRIES
-- Public read. Only R01, R02, R03 can write.
-- ============================================================

ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ministries_read_all"
  ON public.ministries FOR SELECT
  USING (true);

CREATE POLICY "ministries_write_admin"
  ON public.ministries FOR ALL
  USING (public.user_role() IN ('R01', 'R02', 'R03'))
  WITH CHECK (public.user_role() IN ('R01', 'R02', 'R03'));


-- ============================================================
-- 4. CELL GROUPS
-- Public read. R01, R02, R03, R09 can write.
-- ============================================================

ALTER TABLE public.cell_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cell_groups_read_all"
  ON public.cell_groups FOR SELECT
  USING (true);

CREATE POLICY "cell_groups_write_admin"
  ON public.cell_groups FOR ALL
  USING (public.user_role() IN ('R01', 'R02', 'R03', 'R09'))
  WITH CHECK (public.user_role() IN ('R01', 'R02', 'R03', 'R09'));


-- ============================================================
-- 5. GIVING TRANSACTIONS
-- Members can read own giving only.
-- R01, R02, R04 can read all.
-- No row can ever be deleted.
-- ============================================================

ALTER TABLE public.giving_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "giving_read_own"
  ON public.giving_transactions FOR SELECT
  USING (
    auth.uid() = member_id
    OR public.user_role() IN ('R01', 'R02', 'R04')
  );

CREATE POLICY "giving_insert_admin"
  ON public.giving_transactions FOR INSERT
  WITH CHECK (
    public.user_role() IN ('R01', 'R02', 'R04')
  );

CREATE POLICY "giving_update_admin"
  ON public.giving_transactions FOR UPDATE
  USING (public.user_role() IN ('R01', 'R02', 'R04'));

-- No DELETE policy = no deletes possible, ever


-- ============================================================
-- 6. PRAYER REQUESTS
-- Members can read/insert own requests.
-- keep_private = true: R01, R02 only.
-- R08 reads non-private assigned requests.
-- ============================================================

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prayer_read"
  ON public.prayer_requests FOR SELECT
  USING (
    -- Own requests always visible
    auth.uid() = requester_id
    -- R01, R02 see everything including private
    OR public.user_role() IN ('R01', 'R02')
    -- R08 sees non-private requests
    OR (public.user_role() = 'R08' AND keep_private = false)
    -- R03, R05 see non-private requests
    OR (public.user_role() IN ('R03', 'R05') AND keep_private = false)
  );

CREATE POLICY "prayer_insert"
  ON public.prayer_requests FOR INSERT
  WITH CHECK (true);  -- public submissions allowed (requester_id can be null)

CREATE POLICY "prayer_update_admin"
  ON public.prayer_requests FOR UPDATE
  USING (public.user_role() IN ('R01', 'R02', 'R08'));


-- ============================================================
-- 7. WORD STREAK LOGS
-- Members can insert/read own logs only.
-- ============================================================

ALTER TABLE public.word_streak_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streak_read_own"
  ON public.word_streak_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "streak_insert_own"
  ON public.word_streak_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 8. SERMONS
-- Public read. R07 can write.
-- ============================================================

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sermons_read_all"
  ON public.sermons FOR SELECT
  USING (true);

CREATE POLICY "sermons_write_media"
  ON public.sermons FOR ALL
  USING (public.user_role() IN ('R01', 'R02', 'R07'))
  WITH CHECK (public.user_role() IN ('R01', 'R02', 'R07'));


-- ============================================================
-- 9. EVENTS
-- Public read. R01, R02, R03, R05, R06 can write.
-- ============================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_read_all"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "events_write_admin"
  ON public.events FOR ALL
  USING (public.user_role() IN ('R01', 'R02', 'R03', 'R05', 'R06'))
  WITH CHECK (public.user_role() IN ('R01', 'R02', 'R03', 'R05', 'R06'));


-- ============================================================
-- 10. EVENT REGISTRATIONS
-- Members can read/insert own registrations.
-- R01, R02, R03, R05 can read all.
-- ============================================================

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_reg_read"
  ON public.event_registrations FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.user_role() IN ('R01', 'R02', 'R03', 'R05')
  );

CREATE POLICY "event_reg_insert"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 11. ATTENDANCE
-- R01, R02, R03, R09 can read all.
-- R01, R03, R09 can insert.
-- ============================================================

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_read_admin"
  ON public.attendance FOR SELECT
  USING (public.user_role() IN ('R01', 'R02', 'R03', 'R09'));

CREATE POLICY "attendance_insert_admin"
  ON public.attendance FOR INSERT
  WITH CHECK (public.user_role() IN ('R01', 'R03', 'R09'));


-- ============================================================
-- 12. SERVICE RECORDS
-- R01, R02, R03, R09 can read.
-- R01, R03, R09 can insert/update.
-- ============================================================

ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_records_read"
  ON public.service_records FOR SELECT
  USING (public.user_role() IN ('R01', 'R02', 'R03', 'R09'));

CREATE POLICY "service_records_write"
  ON public.service_records FOR INSERT
  WITH CHECK (public.user_role() IN ('R01', 'R03', 'R09'));

CREATE POLICY "service_records_update"
  ON public.service_records FOR UPDATE
  USING (public.user_role() IN ('R01', 'R03'));


-- ============================================================
-- 13. CONFERENCE MEETINGS
-- R01, R02 can read/write all.
-- R03-R09 can read only meetings where they are a participant.
-- ============================================================

ALTER TABLE public.conference_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conference_meetings_admin"
  ON public.conference_meetings FOR ALL
  USING (public.user_role() IN ('R01', 'R02'))
  WITH CHECK (public.user_role() IN ('R01', 'R02'));

CREATE POLICY "conference_meetings_participant"
  ON public.conference_meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conference_participants cp
      WHERE cp.meeting_id = id
      AND cp.user_id = auth.uid()
    )
  );


-- ============================================================
-- 14. CONFERENCE PARTICIPANTS
-- Users can read own participation rows.
-- R01, R02 can read/write all.
-- ============================================================

ALTER TABLE public.conference_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conf_participants_read_own"
  ON public.conference_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.user_role() IN ('R01', 'R02')
  );

CREATE POLICY "conf_participants_write_admin"
  ON public.conference_participants FOR INSERT
  WITH CHECK (public.user_role() IN ('R01', 'R02'));


-- ============================================================
-- 15. CONVERSATIONS AND MESSAGES
-- Participants can read only their own conversations.
-- ============================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_participant"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id
      AND cp.user_id = auth.uid()
    )
    OR public.user_role() IN ('R01', 'R02')
  );

CREATE POLICY "conversations_insert"
  ON public.conversations FOR INSERT
  WITH CHECK (public.user_role() NOT IN ('R11'));

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_participants_read"
  ON public.conversation_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.user_role() IN ('R01', 'R02')
  );

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_read"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id = auth.uid()
    )
  );


-- ============================================================
-- 16. USER KEY PAIRS
-- Users can read/write only their own key pair.
-- ============================================================

ALTER TABLE public.user_key_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "key_pairs_own"
  ON public.user_key_pairs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 17. DEVOTIONALS
-- Public read. R07, R03 can write.
-- ============================================================

ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devotionals_read_all"
  ON public.devotionals FOR SELECT
  USING (true);

CREATE POLICY "devotionals_write_media"
  ON public.devotionals FOR ALL
  USING (public.user_role() IN ('R01', 'R02', 'R03', 'R07'))
  WITH CHECK (public.user_role() IN ('R01', 'R02', 'R03', 'R07'));


-- ============================================================
-- 18. PRAYER CONNECT SESSIONS
-- Public read. R01, R02, R03 can write.
-- ============================================================

ALTER TABLE public.prayer_connect_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prayer_connect_read_all"
  ON public.prayer_connect_sessions FOR SELECT
  USING (true);

CREATE POLICY "prayer_connect_write_admin"
  ON public.prayer_connect_sessions FOR ALL
  USING (public.user_role() IN ('R01', 'R02', 'R03'))
  WITH CHECK (public.user_role() IN ('R01', 'R02', 'R03'));


-- ============================================================
-- 19. NOTIFICATION LOGS
-- INSERT only by system. R01, R02 can SELECT all.
-- ============================================================

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_logs_read_admin"
  ON public.notification_logs FOR SELECT
  USING (public.user_role() IN ('R01', 'R02'));

CREATE POLICY "notif_logs_insert_system"
  ON public.notification_logs FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- 20. AUDIT LOGS
-- INSERT only for all roles. No UPDATE or DELETE ever.
-- R01 can SELECT all.
-- ============================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_read_superadmin"
  ON public.audit_logs FOR SELECT
  USING (public.user_role() = 'R01');

CREATE POLICY "audit_logs_insert_all"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- No UPDATE policy = no updates possible
-- No DELETE policy = no deletes possible, ever


-- ============================================================
-- DEV BRIDGE — remove in Week 6 when Supabase Auth is wired
-- Allows server-side anon key reads since proxy.ts RBAC
-- already enforces role checks before routes are reached
-- ============================================================

CREATE POLICY "members_read_server_bridge"
  ON public.members FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "users_read_server_bridge"
  ON public.users FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "service_records_read_bridge"
  ON public.service_records FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "attendance_read_bridge"
  ON public.attendance FOR SELECT
  USING (auth.uid() IS NULL);