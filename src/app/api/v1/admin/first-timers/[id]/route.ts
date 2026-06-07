// src/app/api/v1/admin/first-timers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/auth/permissions'

const ACCESS_ROLES = ['R01', 'R02', 'R03']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role   = req.headers.get('x-user-role') ?? ''
  const userId = req.headers.get('x-user-id') ?? ''
  if (!(await userHasPermission(userId, role, ACCESS_ROLES, 'FIRST_TIMERS_ACCESS')))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const allowed = ['status', 'assigned_to', 'notes']
  const updates: Record<string, any> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (!Object.keys(updates).length)
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('first_timers')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
