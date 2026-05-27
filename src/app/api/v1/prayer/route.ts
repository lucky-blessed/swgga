// src/app/api/v1/prayer/route.ts
// Member-facing prayer API — R10+
// GET:  member sees only their own requests
// POST: member submits a new prayer request

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_URGENCY = ['normal', 'urgent']
const VALID_STATUS  = ['new', 'in_progress', 'prayed_for', 'resolved']

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? 'all'
  const page   = Math.max(1,  parseInt(searchParams.get('page')  ?? '1'))
  const limit  = Math.min(20, parseInt(searchParams.get('limit') ?? '10'))
  const offset = (page - 1) * limit

  const supabase = await createServiceClient()

  let query = supabase
    .from('prayer_requests')
    .select(`
      id, content, urgency, keep_private,
      status, created_at, resolved_at
    `, { count: 'exact' })
    .eq('requester_id', userId)

  if (status !== 'all' && VALID_STATUS.includes(status)) {
    query = query.eq('status', status)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[api/v1/prayer GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 })
  }

  return NextResponse.json({
    requests: data ?? [],
    total:    count ?? 0,
    page,
    limit,
    pages:    Math.ceil((count ?? 0) / limit),
  })
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)

  if (!body?.content?.trim()) {
    return NextResponse.json({ error: 'Prayer request content is required' }, { status: 400 })
  }

  if (body.content.trim().length < 10) {
    return NextResponse.json(
      { error: 'Please provide more detail in your prayer request' },
      { status: 400 }
    )
  }

  if (body.urgency && !VALID_URGENCY.includes(body.urgency)) {
    return NextResponse.json({ error: 'Invalid urgency value' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({
      requester_id:  userId,
      source:        'portal',
      content:       body.content.trim(),
      urgency:       body.urgency    ?? 'normal',
      keep_private:  body.keep_private ?? false,
      status:        'new',
    })
    .select('id, content, urgency, keep_private, status, created_at')
    .single()

  if (error) {
    console.error('[api/v1/prayer POST]', error.message)
    return NextResponse.json({ error: 'Failed to submit prayer request' }, { status: 500 })
  }

  return NextResponse.json({ request: data }, { status: 201 })
}