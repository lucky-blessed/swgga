// src/app/api/v1/admin/attendance/service/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R09']
const EDIT_ROLES   = ['R01', 'R03']
const SERVICE_TYPES = ['sunday_first', 'sunday_second', 'wednesday', 'special']

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.headers.get('x-user-role')
  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_records')
    .select(`
      id, service_date, service_type, total_count,
      men_count, women_count, children_count, first_timers,
      notes, event_id, created_at,
      users!service_records_recorded_by_fkey (
        id,
        members ( first_name, last_name )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }

  const u = data.users as any
  const m = u?.members as any

  return NextResponse.json({
    ...data,
    recorded_by: {
      id:   u?.id ?? null,
      name: m ? `${m.first_name} ${m.last_name}`.trim() : 'Unknown',
    },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  if (body.service_type && !SERVICE_TYPES.includes(body.service_type)) {
    return NextResponse.json({ error: 'Invalid service_type' }, { status: 400 })
  }

  if (body.total_count != null && (typeof body.total_count !== 'number' || body.total_count < 0)) {
    return NextResponse.json({ error: 'total_count must be a non-negative number' }, { status: 400 })
  }

  const allowed = ['service_date', 'service_type', 'total_count', 'men_count',
                   'women_count', 'children_count', 'first_timers', 'notes', 'event_id']

  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A record for this service date and type already exists' },
        { status: 409 }
      )
    }
    console.error('[admin/attendance/service PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'UPDATE_SERVICE_ATTENDANCE',
    resource_type: 'service_record',
    resource_id:   id,
  })

  return NextResponse.json({ record: data })
}