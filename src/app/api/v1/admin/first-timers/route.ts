// src/app/api/v1/admin/first-timers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/auth/permissions'

const ACCESS_ROLES = ['R01', 'R02', 'R03']

export async function GET(req: NextRequest) {
  const role   = req.headers.get('x-user-role') ?? ''
  const userId = req.headers.get('x-user-id') ?? ''
  if (!(await userHasPermission(userId, role, ACCESS_ROLES, 'FIRST_TIMERS_ACCESS')))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? 'all'
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset = (page - 1) * limit

  const supabase = await createServiceClient()
  let query = supabase
    .from('first_timers')
    .select(`
      id, first_name, last_name, phone, email,
      heard_from, message, status, notes, created_at, updated_at,
      assigned_to:users!first_timers_assigned_to_fkey (
        id, members ( first_name, last_name )
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') query = query.eq('status', status)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const firstTimers = (data ?? []).map((r: any) => ({
    ...r,
    assigned_to: r.assigned_to ? {
      id:   r.assigned_to.id,
      name: r.assigned_to.members
        ? `${r.assigned_to.members.first_name} ${r.assigned_to.members.last_name}`.trim()
        : 'Unknown',
    } : null,
  }))

  return NextResponse.json({ first_timers: firstTimers, total: count ?? 0, page, limit })
}

export async function POST(req: NextRequest) {
  // Public endpoint — no auth required (called from contact form)
  const body = await req.json().catch(() => null)
  if (!body?.first_name || !body?.last_name || !body?.phone)
    return NextResponse.json({ error: 'first_name, last_name and phone are required' }, { status: 400 })

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('first_timers')
    .insert({
      first_name: body.first_name.trim(),
      last_name:  body.last_name.trim(),
      phone:      body.phone.trim(),
      email:      body.email?.trim() ?? null,
      heard_from: body.heard_from ?? null,
      message:    body.message?.trim() ?? null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })

  // Notify all users with FIRST_TIMERS_ACCESS
  try {
    const { data: accessUsers } = await supabase
      .from('users')
      .select('email, members(first_name)')
      .in('role', ['R01', 'R02', 'R03'])
      .eq('is_active', true)

    const { sendEmail } = await import('@/lib/notifications/email')
    for (const u of accessUsers ?? []) {
      if (!u.email) continue
      const name = `${body.first_name} ${body.last_name}`
      await sendEmail(
        u.email,
        `New First Timer: ${name}`,
        `<p>A new first timer submitted their details on the website.</p>
         <p><strong>Name:</strong> ${name}</p>
         <p><strong>Phone:</strong> ${body.phone}</p>
         ${body.email ? `<p><strong>Email:</strong> ${body.email}</p>` : ''}
         ${body.heard_from ? `<p><strong>Heard from:</strong> ${body.heard_from}</p>` : ''}
         ${body.message ? `<p><strong>Message:</strong> ${body.message}</p>` : ''}
         <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/first-timers">View in Admin Platform</a></p>`
      ).catch(() => {})
    }
  } catch {}

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
