// src/app/api/v1/admin/members/[id]/route.ts
// Single member - GET full profile, PUT update fields
import { userHasPermission } from '@/lib/auth/permissions'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['R01', 'R02', 'R03', 'R04', 'R05']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get("x-user-id")
  if (!(await userHasPermission(userId ?? "", role ?? "", ALLOWED_ROLES, "MEMBER_MANAGEMENT"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('members')
    .select(`
      id, first_name, last_name, date_of_birth,
      address, marital_status, occupation,
      baptism_date, joined_date, membership_status,
      pastoral_notes, last_attendance_date,
      users (
        id, email, phone, role, is_active,
        word_streak_count, profile_photo_url, created_at,
        ministry_id, cell_group_id,
        ministries ( id, name, slug )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[admin/members/id GET]', error?.message)
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Flatten users nested object to match AdminMember type
  const u = (data as any).users ?? {}
  const flat = {
    id:                   data.id,
    first_name:           data.first_name,
    last_name:            data.last_name,
    full_name:            ((data.first_name ?? '') + ' ' + (data.last_name ?? '')).trim(),
    date_of_birth:        data.date_of_birth,
    address:              data.address,
    marital_status:       data.marital_status,
    occupation:           data.occupation,
    baptism_date:         data.baptism_date,
    joined_date:          data.joined_date,
    membership_status:    data.membership_status,
    last_attendance_date: data.last_attendance_date,
    pastoral_notes:       role === 'R01' || role === 'R02' ? data.pastoral_notes : null,
    email:                u.email  ?? null,
    phone:                u.phone  ?? null,
    user_role:            u.role   ?? null,
    is_active:            u.is_active ?? false,
    is_cty_youth:         u.is_cty_youth ?? false,
    ministry_id:          u.ministry_id  ?? null,
    cell_group_id:        u.cell_group_id ?? null,
    word_streak_count:    u.word_streak_count ?? 0,
    profile_photo_url:    u.profile_photo_url ?? null,
    ministry:             u.ministries ?? null,
  }

  return NextResponse.json({ member: flat })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  if (!role || !['R01', 'R02', 'R03'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { id } = await params
  const supabase = await createServiceClient()

  const { email, role: newRole, is_active, ...memberFields } = body

  const allowedMemberFields = [
    'first_name', 'last_name', 'date_of_birth',
    'address', 'marital_status', 'occupation',
    'baptism_date', 'joined_date', 'membership_status',
  ]

  const memberUpdate = Object.fromEntries(
    Object.entries(memberFields).filter(([k]) => allowedMemberFields.includes(k))
  )

  if (Object.keys(memberUpdate).length > 0) {
    const { error } = await supabase
      .from('members')
      .update(memberUpdate)
      .eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }

  // Update users table fields - members.id = users.id directly
  if (email || newRole || is_active !== undefined) {
    const userUpdate: Record<string, unknown> = {}
    if (email)                             userUpdate.email     = email
    if (is_active !== undefined)           userUpdate.is_active = is_active
    if (newRole && role === 'R01')         userUpdate.role      = newRole
    await supabase.from('users').update(userUpdate).eq('id', id)
  }

  return NextResponse.json({ success: true })
}
