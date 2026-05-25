// src/app/api/v1/admin/conference/[id]/join/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const JOIN_ROLES = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !JOIN_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Verify meeting exists and is not cancelled
  const { data: meeting, error: meetingErr } = await supabase
    .from('conference_meetings')
    .select('id, status, jitsi_room_id, meeting_url')
    .eq('id', id)
    .single()

  if (meetingErr || !meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
  }

  if (meeting.status === 'cancelled') {
    return NextResponse.json({ error: 'Meeting has been cancelled' }, { status: 400 })
  }

  // Verify user is a participant
  const { data: participant, error: participantErr } = await supabase
    .from('conference_participants')
    .select('id, joined_at')
    .eq('meeting_id', id)
    .eq('user_id', userId!)
    .single()

  if (participantErr || !participant) {
    return NextResponse.json(
      { error: 'You are not a participant of this meeting' },
      { status: 403 }
    )
  }

  // Record join time — only set once
  if (!participant.joined_at) {
    await supabase
      .from('conference_participants')
      .update({ joined_at: new Date().toISOString() })
      .eq('id', participant.id)
  }

  // Update meeting status to in_progress if still scheduled
  if (meeting.status === 'scheduled') {
    await supabase
      .from('conference_meetings')
      .update({ status: 'in_progress' })
      .eq('id', id)
  }

  return NextResponse.json({
    jitsi_room_id: meeting.jitsi_room_id,
    meeting_url:   meeting.meeting_url,
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !JOIN_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Record leave time
  const { error } = await supabase
    .from('conference_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('meeting_id', id)
    .eq('user_id', userId!)

  if (error) {
    console.error('[admin/conference/join PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to record leave time' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}