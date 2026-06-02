// src/app/api/v1/admin/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userHasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06']
const CREATE_ROLES = ['R01', 'R03', 'R05', 'R06']

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get("x-user-id")
  if (!(await userHasPermission(userId ?? "", role ?? "", VIEW_ROLES, "MEMBER_MANAGEMENT"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const search     = searchParams.get('search')?.trim() ?? ''
  const filter     = searchParams.get('filter')     ?? 'upcoming' // upcoming | past | all
  const ministry   = searchParams.get('ministry')   ?? 'all'
  const is_cty     = searchParams.get('is_cty')     ?? 'all'
  const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit      = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset     = (page - 1) * limit
  const now        = new Date().toISOString()

  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      id, title, description, start_time, end_time,
      location, members_only, registration_enabled,
      is_recurring, recurrence_pattern, is_cty_event,
      created_at, image_url,
      ministries ( id, name, slug ),
      event_registrations ( id )
    `, { count: 'exact' })

  if (search)          query = query.ilike('title', `%${search}%`)
  if (ministry !== 'all') query = query.eq('ministry_id', ministry)
  if (is_cty === 'true')  query = query.eq('is_cty_event', true)
  if (is_cty === 'false') query = query.eq('is_cty_event', false)

  if (filter === 'upcoming') {
    query = query.gte('start_time', now)
  } else if (filter === 'past') {
    query = query.lt('start_time', now)
  }

  query = query
    .order('start_time', { ascending: filter !== 'past' })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/events GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }

  const events = (data ?? []).map((e: any) => ({
    id:                  e.id,
    title:               e.title,
    description:         e.description,
    start_time:          e.start_time,
    end_time:            e.end_time,
    location:            e.location,
    members_only:        e.members_only,
    registration_enabled: e.registration_enabled,
    is_recurring:        e.is_recurring,
    recurrence_pattern:  e.recurrence_pattern,
    is_cty_event:        e.is_cty_event,
    created_at:          e.created_at,
    image_url:           e.image_url ?? null,
    ministry:            e.ministries ?? null,
    registration_count:  e.event_registrations?.length ?? 0,
  }))

  return NextResponse.json({
    events,
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

  if (!body?.title || !body?.start_time) {
    return NextResponse.json(
      { error: 'title and start_time are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .insert({
      title:               body.title,
      description:         body.description         ?? null,
      ministry_id:         body.ministry_id         ?? null,
      start_time:          body.start_time,
      end_time:            body.end_time             ?? null,
      location:            body.location             ?? null,
      members_only:        body.members_only         ?? false,
      registration_enabled: body.registration_enabled ?? true,
      is_recurring:        body.is_recurring         ?? false,
      recurrence_pattern:  body.recurrence_pattern   ?? null,
      is_cty_event:        body.is_cty_event         ?? false,
      created_by:          userId,
    })
    .select()
    .single()

  if (error) {
    console.error('[admin/events POST]', error.message)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'CREATE_EVENT',
    resource_type: 'event',
    resource_id:   data.id,
  })

  return NextResponse.json({ event: data }, { status: 201 })
}