// src/app/api/v1/admin/conference/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userHasPermission } from '@/lib/auth/permissions'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']
const CREATE_ROLES = ['R01', 'R02']

export async function GET(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')
  if (!(await userHasPermission(userId ?? "", role ?? "", VIEW_ROLES, "CONFERENCE_SCHEDULE"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const filter = searchParams.get('filter') ?? 'upcoming' // upcoming | past | all
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset = (page - 1) * limit

  const supabase = createServiceClient()
  const now      = new Date().toISOString()

  const isAdmin = ['R01', 'R02'].includes(role ?? '')

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

  // R01/R02 see all meetings - others see only meetings they are invited to
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

  const meetings = (data ?? []).map((m: any) => normaliseMeeting(m, role ?? ''))

  return NextResponse.json({
    meetings,
    total:  count ?? 0,
    page,
    limit,
    pages:  Math.ceil((count ?? 0) / limit),
  })
}

// Normalise phone numbers to E.164 format for Twilio
function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (phone.startsWith('+')) return phone
  if (digits.startsWith('234')) return `+${digits}`
  if (digits.startsWith('0'))   return `+234${digits.slice(1)}`
  return null
}

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !CREATE_ROLES.includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)

  if (!body?.title || !body?.scheduled_time) {
    return NextResponse.json(
      { error: 'title and scheduled_time are required' },
      { status: 400 }
    )
  }

  // Generate Jitsi room ID - format: swgga-{8 random hex chars}
  const jitsi_room_id = `swgga-${crypto.randomUUID().slice(0, 8)}`
  const meeting_url   = `https://meet.jit.si/${jitsi_room_id}`

  const supabase = createServiceClient()

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

  // Add participants if provided + send notifications
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
    } else {
      // Fetch invitee details for notifications
      const { data: invitees, error: inviteesErr } = await supabase
        .from('users')
        .select(`
          id, email, phone,
          members ( first_name, last_name )
        `)
        .in('id', body.participant_ids as string[])

      console.log('[conference] invitees query error:', inviteesErr?.message ?? 'none')
      console.log('[conference] participant_ids:', body.participant_ids)

      console.log('[conference] invitees fetched:', invitees?.length ?? 0, JSON.stringify(invitees?.map((i: any) => ({ id: i.id, email: i.email, phone: i.phone }))))

      if (invitees?.length) {
        const scheduledDate = new Date(meeting.scheduled_time)
        const formattedTime = scheduledDate.toLocaleString('en-GB', {
          weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
        })

        await Promise.allSettled(
          invitees.map(async (invitee: any) => {
            const memberName = invitee.members
              ? `${invitee.members.first_name} ${invitee.members.last_name}`.trim()
              : 'Leader'
            const firstName = invitee.members?.first_name ?? 'Leader'

            // ── Email (SendGrid) ────────────────────────────────────────────
            if (invitee.email) {
              try {
                const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    personalizations: [{ to: [{ email: invitee.email, name: memberName }] }],
                    from:    { email: process.env.SENDGRID_FROM_EMAIL!, name: 'SWGGA Admin' },
                    subject: `Meeting Invite: ${meeting.title}`,
                    content: [{ type: 'text/html', value: `
                      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#060E1A;color:#E2E8F0;padding:32px;border-radius:12px;">
                        <h2 style="color:#F5C518;margin:0 0 8px;">📅 You've Been Invited to a Meeting</h2>
                        <p style="color:#94A3B8;margin:0 0 24px;">Hi ${firstName}, you have been invited to attend the following leadership meeting.</p>
                        <div style="background:#0A1628;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;margin-bottom:24px;">
                          <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#fff;">${meeting.title}</p>
                          <p style="margin:0 0 4px;color:#94A3B8;font-size:14px;">🕐 ${formattedTime} WAT</p>
                          <p style="margin:0 0 4px;color:#94A3B8;font-size:14px;">⏱ Duration: ${meeting.duration_minutes} minutes</p>
                          ${meeting.notes ? `<p style="margin:12px 0 0;color:#64748B;font-size:13px;font-style:italic;">${meeting.notes}</p>` : ''}
                        </div>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/conference/${meeting.id}"
                          style="display:inline-block;background:#1E3A8A;color:#fff;padding:12px 24px;
                                  border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                          View Meeting
                        </a>
                        <p style="margin:24px 0 0;color:#334155;font-size:12px;">
                          Sure Word Glorious Gospel Assembly · SWGGA Admin Platform
                        </p>
                      </div>
                    ` }],
                  }),
                })

                console.log('[conference] SendGrid status:', sgRes.status, invitee.email)
                if (!sgRes.ok) {
                  const sgErr = await sgRes.text()
                  console.error('[conference] SendGrid error body:', sgErr)
                }
              } catch (err) {
                console.error('[conference] SendGrid fetch threw:', err)
              }
            }

            // ── SMS (Twilio) ────────────────────────────────────────────────
            if (invitee.phone) {
              const e164Phone = toE164(invitee.phone)
              if (!e164Phone) {
                console.warn("[conference] Skipping invalid phone:", invitee.phone)
              } else {
              const smsBody =
                `SWGGA Meeting Invite: "${meeting.title}" on ${formattedTime} WAT. ` +
                `Duration: ${meeting.duration_minutes} min. ` +
                `View: ${process.env.NEXT_PUBLIC_APP_URL}/admin/conference/${meeting.id}`

              try {
                const twRes = await fetch(
                  `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Basic ${Buffer.from(
                        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
                      ).toString('base64')}`,
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                      From: process.env.TWILIO_PHONE_NUMBER!,
                      To:   e164Phone,
                      Body: smsBody,
                    }).toString(),
                  }
                )

                console.log('[conference] Twilio status:', twRes.status, invitee.phone)
                if (!twRes.ok) {
                  const twErr = await twRes.text()
                  console.error('[conference] Twilio error body:', twErr)
                }

                await supabase
                  .from('conference_participants')
                  .update({ sms_sent: true, notified_at: new Date().toISOString() })
                  .eq('meeting_id', meeting.id)
                  .eq('user_id', invitee.id)
              } catch (err) {
                console.error('[conference] Twilio fetch threw:', err)
              }
            } }
          })
        )
      }
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
  const isAdmin     = ['R01', 'R02'].includes(role ?? '')
  const creatorMember = m.creator?.members as any

  return {
    id:                m.id,
    title:             m.title,
    scheduled_time:    m.scheduled_time,
    duration_minutes:  m.duration_minutes,
    jitsi_room_id:     m.jitsi_room_id,
    // Meeting URL only visible to R01/R02 in UI - still returned for join logic
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