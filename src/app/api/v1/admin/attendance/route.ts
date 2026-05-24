// src/app/api/v1/admin/attendance/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R09']
const RECORD_ROLES = ['R01', 'R03', 'R09']

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const member_id    = searchParams.get('member_id')  ?? ''
  const event_id     = searchParams.get('event_id')   ?? ''
  const from         = searchParams.get('from')        ?? ''
  const to           = searchParams.get('to')          ?? ''
  const page         = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit        = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset       = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('attendance')
    .select(`
      id,
      service_date,
      event_id,
      created_at,
      member:users!attendance_member_id_fkey (
        id,
        members ( first_name, last_name )
      ),
      recorder:users!attendance_recorded_by_fkey (
        id,
        members ( first_name, last_name )
      )
    `, { count: 'exact' })

  if (member_id) query = query.eq('member_id',   member_id)
  if (event_id)  query = query.eq('event_id',    event_id)
  if (from)      query = query.gte('service_date', from)
  if (to)        query = query.lte('service_date', to)

  query = query
    .order('service_date', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/attendance GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }

  const records = (data ?? []).map((r: any) => {
    const member   = r.member?.members   as any
    const recorder = r.recorder?.members as any
    return {
      id:           r.id,
      service_date: r.service_date,
      event_id:     r.event_id,
      created_at:   r.created_at,
      member: {
        id:   r.member?.id,
        name: member ? `${member.first_name} ${member.last_name}`.trim() : 'Unknown',
      },
      recorded_by: {
        id:   r.recorder?.id,
        name: recorder ? `${recorder.first_name} ${recorder.last_name}`.trim() : 'Unknown',
      },
    }
  })

  return NextResponse.json({
    records,
    total:  count ?? 0,
    page,
    limit,
    pages:  Math.ceil((count ?? 0) / limit),
  })
}

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !RECORD_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)

  if (!body?.service_date || !body?.member_ids || !Array.isArray(body.member_ids) || body.member_ids.length === 0) {
    return NextResponse.json(
      { error: 'service_date and member_ids (array) are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const rows = (body.member_ids as string[]).map(member_id => ({
    member_id,
    service_date: body.service_date,
    event_id:     body.event_id ?? null,
    recorded_by:  userId,
  }))

  const { data, error } = await supabase
    .from('attendance')
    .insert(rows)
    .select()

  if (error) {
    console.error('[admin/attendance POST]', error.message)
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'RECORD_MEMBER_ATTENDANCE',
    resource_type: 'attendance',
    resource_id:   null,
  })

  return NextResponse.json({ recorded: data?.length ?? 0 }, { status: 201 })
}