// src/app/api/v1/admin/conference/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']
const CREATE_ROLES = ['R01', 'R02']

export async function GET(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const filter = searchParams.get('filter') ?? 'upcoming' // upcoming | past | all
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset = (page - 1) * limit

  const supabase = await createClient()
  const now      = new Date().toISOString()

  const isAdmin = ['R01', 'R02'].includes(role)

  let query = supabase
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
        id, user_id, category, notified_at, joined_at, left_at, sms_sent,
        users!conference_participants_user_id_fkey (
          id,
          members ( first_name, last_name )
        )
      )
    `, { count: 'exact' })

  // R01/R02 see all meetings — others see only meetings they are invited to
  if (!isAdmin) {
    query = query.eq('conference_participants.user_id', userId)
  }

  if (filter === 'upcoming') {
    query = query
      .gte('scheduled_time', now)
      .in('status', ['scheduled', 'in_progress'])
  } else if (filter === 'past') {
    query = query
      .lt('scheduled_time', now)
      .in('status', ['completed', 'cancelled'])
  }

  query = query
    .order('scheduled_time', { ascending: filter === 'upcoming' })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/conference GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
  }

  const meetings = (data ?? []).map((m: any) => normaliseMeeting(m, role))

  return NextResponse.json({
    meetings,
    total:  count ?? 0,
    page,
    limit,
    pages:  Math.ceil((count ?? 0) / limit),
  })
}

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !CREATE_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)

  if (!body?.title || !body?.scheduled_time) {
    return NextResponse.json(
      { error: 'title and scheduled_time are required' },
      { status: 400 }
    )
  }

  // Generate Jitsi room ID — format: swgga-{8 random hex chars}
  const jitsi_room_id = `swgga-${crypto.randomUUID().slice(0, 8)}`
  const meeting_url   = `https://meet.jit.si/${jitsi_room_id}`

  const supabase = await createClient()

  // Create the meeting
  const { data: meeting, error: meetingErr } = await supabase
    .from('conference_meetings')
    .insert({
      title:             body.title,
      scheduled_time:    body.scheduled_time,
      duration_minutes:  body.duration_minutes  ?? 60,
      created_by:        userId,
      recording_enabled: body.recording_enabled ?? false,
      notes:             body.notes             ?? null,
      jitsi_room_id,
      meeting_url,
      status:            'scheduled',
    })
    .select()
    .single()

  if (meetingErr) {
    console.error('[admin/conference POST]', meetingErr.message)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }

  // Add participants if provided
  if (body.participant_ids?.length > 0) {
    const participantRows = (body.participant_ids as string[]).map((user_id: string) => ({
      meeting_id: meeting.id,
      user_id,
      category:   body.category ?? null,
    }))

    const { error: participantErr } = await supabase
      .from('conference_participants')
      .insert(participantRows)

    if (participantErr) {
      console.error('[admin/conference participants]', participantErr.message)
    }
  }

  // Always add the creator as a participant
  await supabase.from('conference_participants').upsert({
    meeting_id: meeting.id,
    user_id:    userId,
    category:   'leadership',
  }, { onConflict: 'meeting_id,user_id' })

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'CREATE_MEETING',
    resource_type: 'conference_meeting',
    resource_id:   meeting.id,
  })

  return NextResponse.json({ meeting }, { status: 201 })
}

// ─── Normalise ────────────────────────────────────────────────────────────────

function normaliseMeeting(m: any, role: string) {
  const isAdmin     = ['R01', 'R02'].includes(role)
  const creatorMember = m.creator?.members as any

  return {
    id:                m.id,
    title:             m.title,
    scheduled_time:    m.scheduled_time,
    duration_minutes:  m.duration_minutes,
    jitsi_room_id:     m.jitsi_room_id,
    // Meeting URL only visible to R01/R02 in UI — still returned for join logic
    meeting_url:       isAdmin ? m.meeting_url : null,
    notes:             m.notes,
    recording_enabled: m.recording_enabled,
    recording_url:     m.recording_url,
    status:            m.status,
    created_at:        m.created_at,
    created_by: {
      id:   m.creator?.id,
      name: creatorMember
        ? `${creatorMember.first_name} ${creatorMember.last_name}`.trim()
        : 'Unknown',
    },
    participants: (m.conference_participants ?? []).map((p: any) => {
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
}