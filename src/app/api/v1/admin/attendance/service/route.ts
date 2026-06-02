// src/app/api/v1/admin/attendance/service/route.ts
// Aggregate service headcount - GET list, POST new record
import { userHasPermission } from '@/lib/auth/permissions'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R09']
const RECORD_ROLES = ['R01', 'R03', 'R09']

const SERVICE_TYPES = ['sunday_first', 'sunday_second', 'wednesday', 'special']

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const _uid = req.headers.get("x-user-id")
  if (!(await userHasPermission(_uid ?? "", role ?? "", VIEW_ROLES, "MEMBER_MANAGEMENT"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const from  = searchParams.get('from')  ?? ''
  const to    = searchParams.get('to')    ?? ''
  const type  = searchParams.get('type')  ?? 'all'
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('service_records')
    .select(`
      id,
      service_date,
      service_type,
      total_count,
      men_count,
      women_count,
      children_count,
      first_timers,
      notes,
      event_id,
      created_at,
      recorded_by,
      users!service_records_recorded_by_fkey (
        id,
        members ( first_name, last_name )
      )
    `, { count: 'exact' })

  if (from)        query = query.gte('service_date', from)
  if (to)          query = query.lte('service_date', to)
  if (type !== 'all') query = query.eq('service_type', type)

  query = query
    .order('service_date', { ascending: false })
    .order('service_type', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/attendance/service GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch service records' }, { status: 500 })
  }

  const records = (data ?? []).map((r: any) => ({
    id:             r.id,
    service_date:   r.service_date,
    service_type:   r.service_type,
    total_count:    r.total_count,
    men_count:      r.men_count,
    women_count:    r.women_count,
    children_count: r.children_count,
    first_timers:   r.first_timers,
    notes:          r.notes,
    event_id:       r.event_id,
    created_at:     r.created_at,
    recorded_by: {
      id:   r.users?.id,
      name: r.users?.members
        ? `${(r.users as any)?.members?.first_name} ${(r.users as any)?.members?.last_name}`.trim()
        : 'Unknown',
    },
  }))

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

  if (!body?.service_date || !body?.service_type || body?.total_count == null) {
    return NextResponse.json(
      { error: 'service_date, service_type, and total_count are required' },
      { status: 400 }
    )
  }

  if (!SERVICE_TYPES.includes(body.service_type)) {
    return NextResponse.json(
      { error: `service_type must be one of: ${SERVICE_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  if (typeof body.total_count !== 'number' || body.total_count < 0) {
    return NextResponse.json({ error: 'total_count must be a non-negative number' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_records')
    .insert({
      service_date:   body.service_date,
      service_type:   body.service_type,
      total_count:    body.total_count,
      men_count:      body.men_count      ?? null,
      women_count:    body.women_count    ?? null,
      children_count: body.children_count ?? null,
      first_timers:   body.first_timers   ?? 0,
      event_id:       body.event_id       ?? null,
      notes:          body.notes          ?? null,
      recorded_by:    userId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A record for this service date and type already exists' },
        { status: 409 }
      )
    }
    console.error('[admin/attendance/service POST]', error.message)
    return NextResponse.json({ error: 'Failed to save service record' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'RECORD_SERVICE_ATTENDANCE',
    resource_type: 'service_record',
    resource_id:   data.id,
  })

  return NextResponse.json({ record: data }, { status: 201 })
}