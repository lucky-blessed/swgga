// src/app/api/v1/admin/attendance/service/route.ts
// Service attendance records — GET list with Redis cache, POST create

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/auth/permissions'
import { redis } from '@/lib/db/redis'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']
const WRITE_ROLES  = ['R01', 'R02', 'R03', 'R04']
const SERVICE_TYPES = ['sunday_service', 'word_feast', 'moment_of_encounter', 'healing_streams', 'special']
const CACHE_TTL    = 300 // 5 minutes

export async function GET(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  const allowed = await userHasPermission(userId ?? '', role ?? '', VIEW_ROLES, 'MEMBER_MANAGEMENT')
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const from  = searchParams.get('from')  ?? ''
  const to    = searchParams.get('to')    ?? ''
  const type  = searchParams.get('type')  ?? 'all'
  const page  = Math.max(1,   parseInt(searchParams.get('page')  ?? '1'))
  const limit = Math.min(200, parseInt(searchParams.get('limit') ?? '20'))
  const offset = (page - 1) * limit

  // Cache key
  const cacheKey = `attendance:${role}:${from}:${to}:${type}:${page}:${limit}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      const data = typeof cached === 'string' ? JSON.parse(cached) : cached
      return NextResponse.json(data)
    }
  } catch {}

  const supabase = await createServiceClient()

  let query = supabase
    .from('service_records')
    .select(`
      id, service_date, service_type,
      total_count, men_count, women_count, children_count,
      first_timers, notes, event_id, created_at,
      recorded_by:users!service_records_recorded_by_fkey (
        id,
        members ( first_name, last_name )
      )
    `, { count: 'exact' })

  if (from)         query = query.gte('service_date', from)
  if (to)           query = query.lte('service_date', to)
  if (type !== 'all') query = query.eq('service_type', type)

  query = query
    .order('service_date', { ascending: false })
    .order('service_type', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[attendance/service GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
  }

  const records = (data ?? []).map((r: any) => {
    const m = r.recorded_by?.members
    return {
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
        id:   r.recorded_by?.id,
        name: m ? `${m.first_name} ${m.last_name}`.trim() : 'Unknown',
      },
    }
  })

  const response = { records, total: count ?? 0, page, limit }

  // Cache the response
  try {
    await redis.set(cacheKey, JSON.stringify(response), { ex: CACHE_TTL })
  } catch {}

  return NextResponse.json(response)
}

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  const allowed = await userHasPermission(userId ?? '', role ?? '', WRITE_ROLES, 'MEMBER_MANAGEMENT')
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

  const supabase = await createServiceClient()

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
      notes:          body.notes          ?? null,
      event_id:       body.event_id       ?? null,
      recorded_by:    userId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[attendance/service POST]', error.message)
    return NextResponse.json({ error: 'Failed to save service record' }, { status: 500 })
  }

  // Bust cache for this role
  try {
    const keys = await redis.keys(`attendance:${role}:*`)
    if (keys.length) await Promise.all(keys.map(k => redis.del(k)))
    // Also bust other roles that can see attendance
    for (const r of VIEW_ROLES) {
      const rkeys = await redis.keys(`attendance:${r}:*`)
      if (rkeys.length) await Promise.all(rkeys.map(k => redis.del(k)))
    }
  } catch {}

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
