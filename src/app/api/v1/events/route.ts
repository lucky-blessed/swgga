// src/app/api/v1/events/route.ts
// Public events API — R11+ (no auth required)
// Used by the public website events page
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const filter   = searchParams.get('filter')   ?? 'upcoming'
  const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const page     = Math.max(1, parseInt(searchParams.get('page')   ?? '1'))
  const offset   = (page - 1) * limit
  const now      = new Date().toISOString()

  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      id, title, description, start_time, end_time,
      location, members_only, registration_enabled,
      is_cty_event, image_url, created_at,
      ministries ( id, name, slug )
    `, { count: 'exact' })

  if (filter === 'upcoming') query = query.gte('start_time', now)
  if (filter === 'past')     query = query.lt('start_time',  now)

  query = query
    .order('start_time', { ascending: filter !== 'past' })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[api/v1/events GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }

  const events = (data ?? []).map((e: any) => ({
    id:                   e.id,
    title:                e.title,
    description:          e.description,
    start_time:           e.start_time,
    end_time:             e.end_time,
    location:             e.location,
    members_only:         e.members_only,
    registration_enabled: e.registration_enabled,
    is_cty_event:         e.is_cty_event,
    image_url:            e.image_url,
    created_at:           e.created_at,
    ministry:             e.ministries ?? null,
  }))

  return NextResponse.json({
    events,
    total:  count ?? 0,
    page,
    limit,
    pages:  Math.ceil((count ?? 0) / limit),
  })
}
