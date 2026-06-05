// src/app/api/v1/admin/members/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userHasPermission } from '@/lib/auth/permissions'
import { createServiceClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['R01', 'R02', 'R03', 'R04', 'R05']

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get("x-user-id")
  if (!(await userHasPermission(userId ?? "", role ?? "", ALLOWED_ROLES, "MEMBER_MANAGEMENT"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const search   = searchParams.get('search')?.trim() ?? ''
  const status   = searchParams.get('status')   ?? 'all'
  const ministry = searchParams.get('ministry') ?? 'all'
  const page     = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset   = (page - 1) * limit

  const supabase = await createServiceClient()

  // members.id === users.id (1-to-1, CASCADE)
  // ministry_id and cell_group_id live on users
  let query = supabase
    .from('members')
    .select(`
      id,
      first_name,
      last_name,
      date_of_birth,
      address,
      marital_status,
      occupation,
      baptism_date,
      joined_date,
      membership_status,
      pastoral_notes,
      last_attendance_date,
      users (
        id,
        email,
        phone,
        role,
        is_active,
        is_cty_youth,
        ministry_id,
        cell_group_id,
        word_streak_count,
        profile_photo_url,
        created_at,
        ministries ( id, name, slug )
      )
    `, { count: 'exact' })

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    )
  }

  if (status === 'pending_verification') {
    // Show only unverified email accounts
    query = query.eq('users.is_active', false)
  } else if (status !== 'all') {
    // membership_status: active | pending | inactive
    query = query.eq('membership_status', status)
    // Only show email-verified members for these statuses
    query = query.eq('users.is_active', true)
  } else {
    // Default: only show verified members
    query = query.eq('users.is_active', true)
  }

  if (ministry !== 'all') {
    // ministry_id is on users - filter via embedded relation
    query = query.eq('users.ministry_id', ministry)
  }

  query = query
    .order('joined_date', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query
  console.log('[members debug] count:', count, 'error:', error?.message, 'row0:', JSON.stringify(data?.[0]))

  if (error) {
    console.error('[admin/members] error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch members', detail: error.message }, { status: 500 })
  }

  // Normalise shape for the frontend - merge users fields up
  const members = (data ?? []).map((m: any) => {
    const u = m.users ?? {}
    return {
      id:                  m.id,
      full_name:           `${m.first_name} ${m.last_name}`.trim(),
      first_name:          m.first_name,
      last_name:           m.last_name,
      date_of_birth:       m.date_of_birth,
      address:             m.address,
      marital_status:      m.marital_status,
      occupation:          m.occupation,
      baptism_date:        m.baptism_date,
      joined_date:         m.joined_date,
      membership_status:   m.membership_status,
      last_attendance_date: m.last_attendance_date,
      // pastoral_notes only included for R01/R02
      ...((['R01', 'R02'].includes(role ?? '')) ? { pastoral_notes: m.pastoral_notes } : {}),
      // from users
      email:               u.email,
      phone:               u.phone,
      user_role:           u.role,
      is_active:           u.is_active,
      is_cty_youth:        u.is_cty_youth,
      ministry_id:         u.ministry_id,
      cell_group_id:       u.cell_group_id,
      word_streak_count:   u.word_streak_count,
      profile_photo_url:   u.profile_photo_url,
      ministry:            u.ministries ?? null,
      created_at:          u.created_at,
    }
  })

  return NextResponse.json({
    members,
    total: count ?? 0,
    page,
    limit,
    pages: Math.ceil((count ?? 0) / limit),
  })
}

export async function PATCH(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !['R01', 'R02', 'R03'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.memberId || !body?.status) {
    return NextResponse.json({ error: 'memberId and status required' }, { status: 400 })
  }

  const validStatuses = ['active', 'pending', 'inactive']
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // members.id === users.id - update membership_status on members
  const { error: updateErr } = await supabase
    .from('members')
    .update({ membership_status: body.status })
    .eq('id', body.memberId)

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'UPDATE_MEMBER_STATUS',
    resource_type: 'member',
    resource_id:   body.memberId,
  })

  return NextResponse.json({ success: true })
}