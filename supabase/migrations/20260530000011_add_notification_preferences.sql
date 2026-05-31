-- Migration: Add notification_preferences column to users table
-- Date: 2026-05-30

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.users.notification_preferences IS
'Per-user notification preferences: email_event_reminders, email_prayer_updates,
email_sermon_alerts, email_announcements, email_giving_receipts,
sms_event_reminders, sms_prayer_updates, sms_otp, sms_announcements';
