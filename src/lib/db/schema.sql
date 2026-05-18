-- ============================================================
-- SWGGA DIGITAL PLATFORM — DATABASE SCHEMA
-- Version: 1.0
-- Reference: TADD v1.1, Section 6
-- Run this file in Supabase SQL Editor to initialise the database
-- ============================================================


-- ============================================================
-- 1. USERS
-- Central table for all platform users (roles R01-R11)
-- ============================================================

CREATE TABLE public.users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT UNIQUE,
  phone                 TEXT UNIQUE,
  password_hash         TEXT,                          -- bcrypt hash, never plaintext
  role                  TEXT NOT NULL DEFAULT 'R10',   -- R01 to R11
  is_active             BOOLEAN DEFAULT true,
  is_cty_youth          BOOLEAN DEFAULT false,         -- CTY safeguarding flag
  ministry_id           UUID,
  cell_group_id         UUID,
  word_streak_count     INTEGER DEFAULT 0,
  word_streak_last_date DATE,                          -- WAT timezone
  profile_photo_url     TEXT,                          -- Cloudinary URL
  google_id             TEXT UNIQUE,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX users_email_idx ON public.users(email);
CREATE INDEX users_phone_idx ON public.users(phone);
CREATE INDEX users_role_idx  ON public.users(role);


-- ============================================================
-- 2. MEMBERS
-- Extended profile data for church members
-- Linked 1-to-1 with users table
-- ============================================================

CREATE TABLE public.members (
  id                   UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  date_of_birth        DATE,
  address              TEXT,
  marital_status       TEXT,                           -- single, married, widowed, divorced
  occupation           TEXT,
  baptism_date         DATE,
  joined_date          DATE DEFAULT CURRENT_DATE,
  membership_status    TEXT DEFAULT 'active',          -- active, pending, inactive
  pastoral_notes       TEXT,                           -- restricted: R01 and R02 only
  last_attendance_date DATE
);


-- ============================================================
-- 3. MINISTRIES
-- All church ministries including Pastor Chii Daily and CTY
-- ============================================================

CREATE TABLE public.ministries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,                    -- URL-friendly e.g. pastor-chii-daily
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 4. CELL GROUPS (Impact Fellowship)
-- Small weekly community groups across Warri and Effurun
-- ============================================================

CREATE TABLE public.cell_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  leader_id   UUID REFERENCES public.users(id),
  location    TEXT,
  meeting_day TEXT,                                    -- e.g. Friday
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 5. DEVOTIONALS
-- Daily devotional content for Pastor Chii Daily page
-- ============================================================

CREATE TABLE public.devotionals (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sanity_id              TEXT UNIQUE NOT NULL,          -- Sanity CMS document ID
  title                  TEXT NOT NULL,
  published_date         DATE NOT NULL,
  series                 TEXT,
  topic                  TEXT,
  scripture              TEXT,
  audio_url              TEXT,                          -- S3/CloudFront URL
  audio_duration_seconds INTEGER,
  youtube_url            TEXT,
  podcast_episode_number INTEGER,
  notify_sent            BOOLEAN DEFAULT false,         -- SMS notification dispatched
  published_by           UUID REFERENCES public.users(id),
  created_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX devotionals_date_idx ON public.devotionals(published_date DESC);


-- ============================================================
-- 6. PRAYER CONNECT SESSIONS
-- Configuration for the daily 9pm Facebook Live prayer session
-- ============================================================

CREATE TABLE public.prayer_connect_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_hour       INTEGER NOT NULL DEFAULT 21,    -- 9 PM in WAT (24hr)
  scheduled_minute     INTEGER NOT NULL DEFAULT 0,
  duration_minutes     INTEGER NOT NULL DEFAULT 60,
  facebook_live_url    TEXT,
  facebook_page_id     TEXT,
  whatsapp_channel_url TEXT NOT NULL,
  is_active            BOOLEAN DEFAULT true,
  updated_by           UUID REFERENCES public.users(id),
  updated_at           TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 7. WORD STREAK LOGS
-- Tracks daily devotional and sermon engagement per member
-- Powers the Word Streak feature on the member dashboard
-- ============================================================

CREATE TABLE public.word_streak_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,                         -- devotional_open | sermon_play_60s
  resource_id   UUID NOT NULL,                         -- ID of the devotional or sermon
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,    -- WAT date
  created_at    TIMESTAMPTZ DEFAULT now(),

  -- Prevents double-counting: one log per user per day
  UNIQUE(user_id, activity_date)
);

CREATE INDEX word_streak_user_idx ON public.word_streak_logs(user_id, activity_date DESC);


-- ============================================================
-- 8. SERMONS
-- Sermon and media library records
-- ============================================================

CREATE TABLE public.sermons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sanity_id        TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  content_type     TEXT NOT NULL,                      -- video_youtube | audio_s3 | podcast | notes_pdf
  youtube_url      TEXT,
  audio_url        TEXT,
  notes_url        TEXT,
  speaker          TEXT NOT NULL,
  series           TEXT,
  topic            TEXT,
  scripture        TEXT,
  sermon_date      DATE NOT NULL,
  download_enabled BOOLEAN DEFAULT false,              -- controls S3 signed URL generation
  ministry_tag     UUID REFERENCES public.ministries(id),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX sermons_date_idx    ON public.sermons(sermon_date DESC);
CREATE INDEX sermons_speaker_idx ON public.sermons(speaker);


-- ============================================================
-- 9. EVENTS
-- Church events calendar
-- ============================================================

CREATE TABLE public.events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL,
  description          TEXT,
  ministry_id          UUID REFERENCES public.ministries(id),
  start_time           TIMESTAMPTZ NOT NULL,
  end_time             TIMESTAMPTZ,
  location             TEXT,
  members_only         BOOLEAN DEFAULT false,
  registration_enabled BOOLEAN DEFAULT true,
  is_recurring         BOOLEAN DEFAULT false,
  recurrence_pattern   TEXT,                           -- RRULE e.g. FREQ=WEEKLY;BYDAY=SU
  is_cty_event         BOOLEAN DEFAULT false,
  created_by           UUID REFERENCES public.users(id),
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX events_start_idx ON public.events(start_time ASC);


-- ============================================================
-- 10. EVENT REGISTRATIONS
-- Tracks member registrations for events
-- ============================================================

CREATE TABLE public.event_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  attended      BOOLEAN DEFAULT false,

  UNIQUE(event_id, user_id)
);


-- ============================================================
-- 11. GIVING TRANSACTIONS
-- All giving records — manual entries in Phase 1
-- Payment gateway records in Phase 2
-- ============================================================

CREATE TABLE public.giving_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID REFERENCES public.users(id),    -- NULL for anonymous giving
  amount          NUMERIC(12,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  fund_type       TEXT NOT NULL,                       -- tithe | offering | special_project | cty | healing_streams
  payment_method  TEXT NOT NULL,                       -- bank_transfer | ussd | cash | card | flutterwave
  transaction_ref TEXT UNIQUE,
  paystack_ref    TEXT UNIQUE,                         -- Phase 2
  flutterwave_ref TEXT UNIQUE,                         -- Phase 2
  status          TEXT NOT NULL DEFAULT 'success',     -- success | failed | pending
  recorded_by     UUID REFERENCES public.users(id),
  receipt_sent    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX giving_member_idx  ON public.giving_transactions(member_id);
CREATE INDEX giving_fund_idx    ON public.giving_transactions(fund_type);
CREATE INDEX giving_created_idx ON public.giving_transactions(created_at DESC);


-- ============================================================
-- 12. PRAYER REQUESTS
-- All prayer requests from all sources
-- ============================================================

CREATE TABLE public.prayer_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id      UUID REFERENCES public.users(id),  -- NULL for public submissions
  requester_name    TEXT,                              -- first name for anonymous
  requester_contact TEXT,                              -- phone or email for follow-up
  source            TEXT NOT NULL,                     -- portal | public | prayer_connect | healing_streams
  content           TEXT NOT NULL,
  urgency           TEXT DEFAULT 'normal',             -- normal | urgent
  keep_private      BOOLEAN DEFAULT false,             -- restricts to R01 and R02
  status            TEXT DEFAULT 'new',                -- new | in_progress | prayed_for | resolved
  assigned_to       UUID REFERENCES public.users(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  resolved_at       TIMESTAMPTZ
);

CREATE INDEX prayer_status_idx ON public.prayer_requests(status);
CREATE INDEX prayer_source_idx ON public.prayer_requests(source);


-- ============================================================
-- 13. CONVERSATIONS
-- Chat conversation containers
-- Tier 1 = E2EE | Tier 2 = server-side encrypted
-- ============================================================

CREATE TABLE public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL,                       -- pastoral | healing_streams | group | direct | prayer_connect
  encryption_tier INTEGER NOT NULL,                    -- 1 = E2EE, 2 = AES-256-GCM
  ministry_id     UUID REFERENCES public.ministries(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 14. CONVERSATION PARTICIPANTS
-- Members belonging to each conversation
-- ============================================================

CREATE TABLE public.conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ DEFAULT now(),

  UNIQUE(conversation_id, user_id)
);


-- ============================================================
-- 15. MESSAGES
-- Individual messages — always stored encrypted, never plaintext
-- ============================================================

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id),
  ciphertext      TEXT NOT NULL,                       -- encrypted content
  iv              TEXT NOT NULL,                       -- initialisation vector for decryption
  is_flagged      BOOLEAN DEFAULT false,               -- moderation flag (Tier 2 only)
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON public.messages(conversation_id, created_at ASC);


-- ============================================================
-- 16. USER KEY PAIRS
-- E2EE public/private key pairs for Tier 1 chat
-- Server stores only the encrypted private key — cannot decrypt it
-- ============================================================

CREATE TABLE public.user_key_pairs (
  user_id               UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  public_key            TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT now(),
  rotated_at            TIMESTAMPTZ
);


-- ============================================================
-- 17. ATTENDANCE
-- Service and event attendance records
-- ============================================================

CREATE TABLE public.attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id     UUID REFERENCES public.events(id),      -- NULL for general Sunday service
  service_date DATE NOT NULL,
  recorded_by  UUID NOT NULL REFERENCES public.users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX attendance_member_idx ON public.attendance(member_id, service_date DESC);


-- ============================================================
-- 18. CONFERENCE MEETINGS
-- Leadership video meetings — scheduled by R01 and R02 only
-- ============================================================

CREATE TABLE public.conference_meetings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  scheduled_time    TIMESTAMPTZ NOT NULL,
  duration_minutes  INTEGER DEFAULT 60,
  created_by        UUID NOT NULL REFERENCES public.users(id),
  recording_enabled BOOLEAN DEFAULT false,
  recording_url     TEXT,
  status            TEXT DEFAULT 'scheduled',          -- scheduled | in_progress | completed | cancelled
  created_at        TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 19. CONFERENCE PARTICIPANTS
-- Members invited to each conference meeting
-- ============================================================

CREATE TABLE public.conference_participants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id  UUID NOT NULL REFERENCES public.conference_meetings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category    TEXT,                                    -- leadership category for bulk invite
  notified_at TIMESTAMPTZ,
  joined_at   TIMESTAMPTZ,

  UNIQUE(meeting_id, user_id)
);


-- ============================================================
-- 20. NOTIFICATION LOGS
-- Records every notification attempt and delivery status
-- ============================================================

CREATE TABLE public.notification_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID REFERENCES public.users(id),
  recipient_phone TEXT,
  recipient_email TEXT,
  channel         TEXT NOT NULL,                       -- sms | email | whatsapp
  trigger_type    TEXT NOT NULL,                       -- giving_receipt | welcome | devotional_published etc.
  status          TEXT DEFAULT 'pending',              -- pending | delivered | failed
  retry_count     INTEGER DEFAULT 0,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 21. AUDIT LOGS
-- Records every sensitive action for security and compliance
-- ============================================================

CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID NOT NULL REFERENCES public.users(id),
  action        TEXT NOT NULL,                         -- e.g. view_financial_records
  resource_type TEXT NOT NULL,                         -- e.g. giving_transaction, member
  resource_id   UUID,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX audit_actor_idx    ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX audit_resource_idx ON public.audit_logs(resource_type, resource_id);


-- ============================================================
-- 22. FOREIGN KEY CONSTRAINTS
-- Added after all tables exist to avoid ordering issues
-- ============================================================

ALTER TABLE public.users
  ADD CONSTRAINT users_ministry_fk
  FOREIGN KEY (ministry_id) REFERENCES public.ministries(id);

ALTER TABLE public.users
  ADD CONSTRAINT users_cell_group_fk
  FOREIGN KEY (cell_group_id) REFERENCES public.cell_groups(id);