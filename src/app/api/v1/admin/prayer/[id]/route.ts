// src/app/api/v1/admin/prayer/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R08']
const VALID_STATUS = ['new', 'in_progress', 'prayed_for', 'resolved']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()
  const isAdmin  = ['R01', 'R02'].includes(role)

  const { data, error } = await supabase
    .from('prayer_requests')
    .select(`
      id, requester_name, requester_contact,
      source, content, urgency, keep_private,
      status, created_at, resolved_at,
      requester:users!prayer_requests_requester_id_fkey (
        id, email, phone,
        members ( first_name, last_name )
      ),
      assignee:users!prayer_requests_assigned_to_fkey (
        id,
        members ( first_name, last_name )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 })
  }

  // R08 cannot see private requests
  if (!isAdmin && data.keep_private) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // R08 can only see their assigned requests
  if (role === 'R08' && (data.assignee as any)?.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rm = (data.requester as any)?.members as any
  const am = (data.assignee as any)?.members  as any

  return NextResponse.json({
    request: {
      id:                data.id,
      requester_name:    rm
        ? `${rm.first_name} ${rm.last_name}`.trim()
        : (data.requester_name ?? 'Anonymous'),
      requester_contact: data.requester_contact,
      requester_id:      (data.requester as any)?.id ?? null,
      requester_email:   (data.requester as any)?.email ?? null,
      requester_phone:   (data.requester as any)?.phone ?? null,
      source:            data.source,
      content:           data.content,
      urgency:           data.urgency,
      keep_private:      data.keep_private,
      status:            data.status,
      created_at:        data.created_at,
      resolved_at:       data.resolved_at,
      assigned_to: (data.assignee as any) ? {
        id:   (data.assignee as any).id,
        name: am ? `${am.first_name} ${am.last_name}`.trim() : 'Unknown',
      } : null,
    }
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (body.status && !VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const allowed  = ['status', 'assigned_to']
  const updates: any = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // Set resolved_at when marking resolved
  if (updates.status === 'resolved') {
    updates.resolved_at = new Date().toISOString()
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prayer_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/prayer PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update prayer request' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'UPDATE_PRAYER_REQUEST',
    resource_type: 'prayer_request',
    resource_id:   id,
  })

  return NextResponse.json({ request: data })
}