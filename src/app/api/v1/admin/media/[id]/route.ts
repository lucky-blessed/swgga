// src/app/api/v1/admin/media/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEW_ROLES   = ['R01', 'R02', 'R03', 'R04', 'R05', 'R07']
const EDIT_ROLES   = ['R01', 'R02', 'R07']
const DELETE_ROLES = ['R01']

const CONTENT_TYPES = [
  'video_youtube', 'video_facebook', 'audio_s3', 'podcast', 'notes_pdf'
]

const ALLOWED_UPDATE_FIELDS = [
  'title', 'content_type', 'video_url', 'audio_url', 'notes_url',
  'speaker', 'series', 'topic', 'scripture', 'sermon_date',
  'download_enabled', 'ministry_tag',
]

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  if (!role || !VIEW_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sermons')
    .select(`
      id, sanity_id, title, content_type,
      video_url, audio_url, notes_url,
      speaker, series, topic, scripture,
      sermon_date, download_enabled,
      ministry_tag, created_at,
      ministries ( id, name, slug )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Sermon not found' }, { status: 404 })
  }

  return NextResponse.json({ sermon: data })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  if (body.content_type && !CONTENT_TYPES.includes(body.content_type)) {
    return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
  }

  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sermons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/media PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update sermon' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'UPDATE_SERMON',
    resource_type: 'sermon',
    resource_id:   id,
  })

  return NextResponse.json({ sermon: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !DELETE_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Soft delete — sermons are never hard deleted per TADD
  const { error } = await supabase
    .from('sermons')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admin/media DELETE]', error.message)
    return NextResponse.json({ error: 'Failed to delete sermon' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'DELETE_SERMON',
    resource_type: 'sermon',
    resource_id:   id,
  })

  return NextResponse.json({ success: true })
}