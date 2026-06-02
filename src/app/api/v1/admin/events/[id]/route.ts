// src/app/api/v1/admin/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userHasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06']
const EDIT_ROLES   = ['R01', 'R03', 'R05', 'R06']
const DELETE_ROLES = ['R01']

const ALLOWED_UPDATE_FIELDS = [
  'title', 'description', 'ministry_id', 'start_time', 'end_time',
  'location', 'members_only', 'registration_enabled',
  'is_recurring', 'recurrence_pattern', 'is_cty_event', 'image_url',
]

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  const _uid = req.headers.get("x-user-id")
  if (!(await userHasPermission(_uid ?? "", role ?? "", VIEW_ROLES, "MEMBER_MANAGEMENT"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      id, title, description, start_time, end_time,
      location, members_only, registration_enabled,
      is_recurring, recurrence_pattern, is_cty_event,
      created_at,
      ministries ( id, name, slug ),
      event_registrations (
        id, registered_at, attended,
        users!event_registrations_user_id_fkey (
          id,
          members ( first_name, last_name )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json({
    event: {
      id:                   data.id,
      title:                data.title,
      description:          data.description,
      start_time:           data.start_time,
      end_time:             data.end_time,
      location:             data.location,
      members_only:         data.members_only,
      registration_enabled: data.registration_enabled,
      is_recurring:         data.is_recurring,
      recurrence_pattern:   data.recurrence_pattern,
      is_cty_event:         data.is_cty_event,
      created_at:           data.created_at,
      ministry:             (data as any).ministries ?? null,
      registrations:        ((data as any).event_registrations ?? []).map((r: any) => {
        const m = r.users?.members as any
        return {
          id:            r.id,
          registered_at: r.registered_at,
          attended:      r.attended,
          user: {
            id:   r.users?.id,
            name: m ? `${m.first_name} ${m.last_name}`.trim() : 'Unknown',
          },
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

  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/events PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'UPDATE_EVENT',
    resource_type: 'event',
    resource_id:   id,
  })

  return NextResponse.json({ event: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !DELETE_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admin/events DELETE]', error.message)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'DELETE_EVENT',
    resource_type: 'event',
    resource_id:   id,
  })

  return NextResponse.json({ success: true })
}