// src/app/api/v1/admin/members/[id]/notes/route.ts
// Pastoral notes - R01 and R02 only
import { userHasPermission } from '@/lib/auth/permissions'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['R01', 'R02']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  const _uid = req.headers.get("x-user-id")
  if (!(await userHasPermission(_uid ?? "", role ?? "", ALLOWED_ROLES, "PASTORAL_NOTES"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('members')
    .select('pastoral_notes')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }

  return NextResponse.json({ notes: data?.pastoral_notes ?? '' })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  const _uid = req.headers.get("x-user-id")
  if (!(await userHasPermission(_uid ?? "", role ?? "", ALLOWED_ROLES, "PASTORAL_NOTES"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (body?.notes === undefined) {
    return NextResponse.json({ error: 'Notes content required' }, { status: 400 })
  }

  const { id } = await params
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('members')
    .update({ pastoral_notes: body.notes })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
