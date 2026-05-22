// src/app/api/v1/admin/members/[id]/route.ts
// Single member — GET full profile, PUT update fields

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['R01', 'R02', 'R03', 'R04', 'R05']

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const role = req.headers.get('x-user-role')
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .select(`
      *,
      users!members_user_id_fkey (
        id, email, phone, role, status,
        word_streak, profile_photo_url, created_at
      ),
      ministries ( id, name, slug ),
      cell_groups ( id, name, location )
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Strip pastoral notes from response for R03 and below
  if (role !== 'R01' && role !== 'R02') {
    const { pastoral_notes, has_pastoral_notes, ...rest } = data as any
    return NextResponse.json({ member: rest })
  }

  return NextResponse.json({ member: data })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const role = req.headers.get('x-user-role')
  if (!role || !['R01', 'R02', 'R03'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const supabase = await createClient()

  const { email, role: newRole, status, ...memberFields } = body

  const allowedMemberFields = [
    'full_name', 'phone', 'date_of_birth',
    'address', 'ministry_id', 'cell_group_id', 'joined_date'
  ]
  const memberUpdate = Object.fromEntries(
    Object.entries(memberFields).filter(([k]) => allowedMemberFields.includes(k))
  )

  if (Object.keys(memberUpdate).length > 0) {
    const { error } = await supabase
      .from('members')
      .update(memberUpdate)
      .eq('id', params.id)
    if (error) return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }

  if (email || newRole || status) {
    const { data: member } = await supabase
      .from('members')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (member) {
      const userUpdate: Record<string, string> = {}
      if (email)  userUpdate.email  = email
      if (status) userUpdate.status = status
      if (newRole && role === 'R01') userUpdate.role = newRole

      await supabase.from('users').update(userUpdate).eq('id', member.user_id)
    }
  }

  return NextResponse.json({ success: true })
}