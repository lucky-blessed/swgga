// src/app/api/v1/admin/prayer/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R08']
const VALID_STATUS = ['new', 'in_progress', 'prayed_for', 'resolved']

export async function GET(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const status   = searchParams.get('status')   ?? 'all'
  const source   = searchParams.get('source')   ?? 'all'
  const urgency  = searchParams.get('urgency')  ?? 'all'
  const page     = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset   = (page - 1) * limit

  const supabase = await createClient()
  const isAdmin  = ['R01', 'R02'].includes(role)

  let query = supabase
    .from('prayer_requests')
    .select(`
      id, requester_name, requester_contact,
      source, content, urgency, keep_private,
      status, created_at, resolved_at,
      requester:users!prayer_requests_requester_id_fkey (
        id,
        members ( first_name, last_name )
      ),
      assignee:users!prayer_requests_assigned_to_fkey (
        id,
        members ( first_name, last_name )
      )
    `, { count: 'exact' })

  // R08 sees only assigned requests
  if (role === 'R08') {
    query = query.eq('assigned_to', userId!)
  }

  // Hide private requests from R08
  if (!isAdmin) {
    query = query.eq('keep_private', false)
  }

  if (status  !== 'all') query = query.eq('status',  status)
  if (source  !== 'all') query = query.eq('source',  source)
  if (urgency !== 'all') query = query.eq('urgency', urgency)

  query = query
    .order('urgency',    { ascending: false })  // urgent first
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/prayer GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 })
  }

  const requests = (data ?? []).map((r: any) => {
    const rm = r.requester?.members as any
    const am = r.assignee?.members  as any
    return {
      id:                r.id,
      requester_name:    rm
        ? `${rm.first_name} ${rm.last_name}`.trim()
        : (r.requester_name ?? 'Anonymous'),
      requester_contact: r.requester_contact,
      requester_id:      r.requester?.id ?? null,
      source:            r.source,
      // content only for R01/R02 or if not private
      content:           (isAdmin || !r.keep_private) ? r.content : '[Private]',
      urgency:           r.urgency,
      keep_private:      r.keep_private,
      status:            r.status,
      created_at:        r.created_at,
      resolved_at:       r.resolved_at,
      assigned_to: r.assignee ? {
        id:   r.assignee.id,
        name: am ? `${am.first_name} ${am.last_name}`.trim() : 'Unknown',
      } : null,
    }
  })

  return NextResponse.json({
    requests,
    total:  count ?? 0,
    page,
    limit,
    pages:  Math.ceil((count ?? 0) / limit),
  })
}

export async function PATCH(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.ids || !Array.isArray(body.ids) || !body.status) {
    return NextResponse.json(
      { error: 'ids (array) and status are required' },
      { status: 400 }
    )
  }

  if (!VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = await createClient()

  const updates: any = { status: body.status }
  if (body.status === 'resolved') {
    updates.resolved_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('prayer_requests')
    .update(updates)
    .in('id', body.ids)

  if (error) {
    console.error('[admin/prayer PATCH bulk]', error.message)
    return NextResponse.json({ error: 'Failed to update requests' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'BULK_UPDATE_PRAYER_STATUS',
    resource_type: 'prayer_request',
    resource_id:   null,
  })

  return NextResponse.json({ success: true, updated: body.ids.length })
}