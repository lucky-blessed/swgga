import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_URGENCY = ['normal', 'urgent']

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
    return NextResponse.json({ error: 'Please provide more detail' }, { status: 400 })
  }

  if (body.urgency && !VALID_URGENCY.includes(body.urgency)) {
    return NextResponse.json({ error: 'Invalid urgency value' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({
      requester_id: userId,
      source:       'portal',
      content:      body.content.trim(),
      urgency:      body.urgency      ?? 'normal',
      keep_private: body.keep_private ?? false,
      status:       'new',
    })
    .select('id, content, urgency, keep_private, status, created_at')
    .single()

  if (error) {
    console.error('[api/v1/prayer POST]', error.message)
    return NextResponse.json({ error: 'Failed to submit prayer request' }, { status: 500 })
  }

  return NextResponse.json({ request: data }, { status: 201 })
}
