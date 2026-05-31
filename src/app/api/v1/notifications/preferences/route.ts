// src/app/api/v1/notifications/preferences/route.ts
// Member notification preferences — GET and PATCH

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const DEFAULT_PREFS = {
  email_event_reminders: true,
  email_prayer_updates:  true,
  email_sermon_alerts:   true,
  email_announcements:   true,
  email_giving_receipts: true,
  sms_event_reminders:   true,
  sms_prayer_updates:    true,
  sms_otp:               true,
  sms_announcements:     true,
}

const ALLOWED_KEYS = Object.keys(DEFAULT_PREFS)

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .select('notification_preferences')
    .eq('id', userId)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }

  const preferences = {
    ...DEFAULT_PREFS,
    ...(data?.notification_preferences as Record<string, boolean> ?? {}),
  }

  // Always enforce sms_otp = true
  preferences.sms_otp = true

  return NextResponse.json({ preferences })
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.preferences) {
    return NextResponse.json({ error: 'Preferences object required' }, { status: 400 })
  }

  // Sanitize — only allow known keys, enforce boolean values
  const sanitized: Record<string, boolean> = {}
  for (const key of ALLOWED_KEYS) {
    if (key in body.preferences) {
      sanitized[key] = Boolean(body.preferences[key])
    }
  }

  // Always enforce sms_otp = true regardless of what was sent
  sanitized.sms_otp = true

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('users')
    .update({ notification_preferences: sanitized })
    .eq('id', userId)

  if (error) {
    // Column may not exist yet — store in Redis as fallback
    console.error('[notifications/preferences PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }

  return NextResponse.json({ success: true, preferences: sanitized })
}
