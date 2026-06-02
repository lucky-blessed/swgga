// src/app/api/v1/events/[id]/register/route.ts
// Member event registration - POST to register, DELETE to cancel

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { eventRegistrationEmail } from '@/lib/notifications/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: eventId } = await params
  const supabase = await createServiceClient()

  // Fetch event to validate it exists and registration is enabled
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title, start_time, location, registration_enabled, members_only')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (!event.registration_enabled) {
    return NextResponse.json(
      { error: 'Registration is not enabled for this event' },
      { status: 400 }
    )
  }

  // Check event hasn't already passed
  if (new Date(event.start_time) < new Date()) {
    return NextResponse.json(
      { error: 'This event has already passed' },
      { status: 400 }
    )
  }

  // Insert registration - UNIQUE(event_id, user_id) handles duplicates
  const { data: registration, error: regError } = await supabase
    .from('event_registrations')
    .insert({ event_id: eventId, user_id: userId })
    .select('id, registered_at')
    .single()

  if (regError) {
    if (regError.code === '23505') {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 409 }
      )
    }
    console.error('[events/register POST]', regError.message)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }

  // Fetch member details for confirmation email
  // Non-blocking - don't fail registration if email fails
  try {
    const { data: user } = await supabase
      .from('users')
      .select('email, members ( first_name )')
      .eq('id', userId)
      .single()

    if (user?.email) {
      const member   = user.members as any
      const firstName = member?.first_name ?? 'Member'
      const eventDate = new Date(event.start_time).toLocaleDateString('en-GB', {
        weekday: 'long',
        day:     'numeric',
        month:   'long',
        year:    'numeric',
        hour:    '2-digit',
        minute:  '2-digit',
      })

      await eventRegistrationEmail(
        user.email,
        firstName,
        event.title,
        eventDate,
        event.location ?? 'Sure Word Glorious Gospel Assembly, Warri',
      )
    }
  } catch (emailErr: unknown) {
    // Log but don't fail the registration
    console.error('[events/register POST] email error:', emailErr)
  }

  return NextResponse.json({ registration }, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: eventId } = await params
  const supabase = await createServiceClient()

  // Verify event exists and hasn't passed
  const { data: event } = await supabase
    .from('events')
    .select('start_time')
    .eq('id', eventId)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (new Date(event.start_time) < new Date()) {
    return NextResponse.json(
      { error: 'Cannot cancel registration for a past event' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) {
    console.error('[events/register DELETE]', error.message)
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}