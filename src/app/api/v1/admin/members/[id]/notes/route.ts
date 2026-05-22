// src/app/api/v1/admin/members/[id]/notes/route.ts
// Pastoral notes — GET and POST
// STRICTLY R01 and R02 only. Server-side enforced. No exceptions.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NOTES_ROLES = ['R01', 'R02']

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const role = req.headers.get('x-user-role')
  if (!role || !NOTES_ROLES.includes(role)) return forbidden()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .select('pastoral_notes, has_pastoral_notes, updated_at')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    notes:            data.pastoral_notes    ?? '',
    hasPastoralNotes: data.has_pastoral_notes ?? false,
    updatedAt:        data.updated_at,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')
  if (!role || !NOTES_ROLES.includes(role)) return forbidden()

  const body = await req.json().catch(() => null)
  if (typeof body?.notes !== 'string') {
    return NextResponse.json({ error: 'notes field required' }, { status: 400 })
  }

  const notes = body.notes.trim()

  const supabase = await createClient()

  const { error } = await supabase
    .from('members')
    .update({
      pastoral_notes:     notes,
      has_pastoral_notes: notes.length > 0,
      updated_at:         new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id: userId,
    action:   'UPDATE_PASTORAL_NOTES',
    resource: `member:${params.id}`,
    metadata: { noteLength: notes.length },
  })

  return NextResponse.json({ success: true })
}