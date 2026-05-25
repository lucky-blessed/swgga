// src/app/api/v1/admin/conference/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']
const EDIT_ROLES   = ['R01', 'R02']

const ALLOWED_UPDATE_FIELDS = [
  'title', 'scheduled_time', 'duration_minutes',
  'recording_enabled', 'notes', 'status',
]

const VALID_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()
  const isAdmin  = ['R01', 'R02'].includes(role)

  const { data, error } = await supabase
    .from('conference_meetings')
    .select(`
      id, title, scheduled_time, duration_minutes,
      jitsi_room_id, meeting_url, notes,
      recording_enabled, recording_url, status, created_at,
      creator:users!conference_meetings_created_by_fkey (
        id,
        members ( first_name, last_name )
      ),
      conference_participants (
        id, user_id, category, notified_at,
        joined_at, left_at, sms_sent,
        users!conference_participants_user_id_fkey (
          id,
          members ( first_name, last_name )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
  }

  // Non-admin can only view meetings they are a participant of
  if (!isAdmin) {
    const isParticipant = (data.conference_participants ?? []).some(
      (p: any) => p.user_id === userId
    )
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const creatorMember = (data.creator as any)?.members as any

  return NextResponse.json({
    meeting: {
      id:                data.id,
      title:             data.title,
      scheduled_time:    data.scheduled_time,
      duration_minutes:  data.duration_minutes,
      jitsi_room_id:     data.jitsi_room_id,
      meeting_url:       isAdmin ? data.meeting_url : null,
      notes:             data.notes,
      recording_enabled: data.recording_enabled,
      recording_url:     data.recording_url,
      status:            data.status,
      created_at:        data.created_at,
      created_by: {
        id:   (data.creator as any)?.id,
        name: creatorMember
          ? `${creatorMember.first_name} ${creatorMember.last_name}`.trim()
          : 'Unknown',
      },
      participants: (data.conference_participants ?? []).map((p: any) => {
        const pm = p.users?.members as any
        return {
          id:          p.id,
          user_id:     p.user_id,
          name:        pm ? `${pm.first_name} ${pm.last_name}`.trim() : 'Unknown',
          category:    p.category,
          notified_at: p.notified_at,
          joined_at:   p.joined_at,
          left_at:     p.left_at,
          sms_sent:    p.sms_sent,
        }
      }),
    }
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !EDIT_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Cannot change scheduled_time within 30 minutes of start
  if (body.scheduled_time) {
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('conference_meetings')
      .select('scheduled_time')
      .eq('id', id)
      .single()

    if (existing) {
      const minutesUntilStart =
        (new Date(existing.scheduled_time).getTime() - Date.now()) / 60000
      if (minutesUntilStart < 30) {
        return NextResponse.json(
          { error: 'Cannot change scheduled time within 30 minutes of start' },
          { status: 400 }
        )
      }
    }
  }

  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conference_meetings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/conference PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'UPDATE_MEETING',
    resource_type: 'conference_meeting',
    resource_id:   id,
  })

  return NextResponse.json({ meeting: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !EDIT_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Cancel instead of hard delete
  const { error } = await supabase
    .from('conference_meetings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('status', 'scheduled')

  if (error) {
    console.error('[admin/conference DELETE]', error.message)
    return NextResponse.json({ error: 'Failed to cancel meeting' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'CANCEL_MEETING',
    resource_type: 'conference_meeting',
    resource_id:   id,
  })

  return NextResponse.json({ success: true })
}