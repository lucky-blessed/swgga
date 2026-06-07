// src/app/api/v1/first-timers/route.ts
// Public endpoint — no auth required (contact form submission)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/notifications/email'

export async function POST(req: NextRequest) {
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

  // Notify users with access
  try {
    const { data: accessUsers } = await supabase
      .from('users')
      .select('email')
      .in('role', ['R01', 'R02', 'R03'])
      .eq('is_active', true)

    const name = `${body.first_name} ${body.last_name}`
    for (const u of accessUsers ?? []) {
      if (!u.email) continue
      await sendEmail(
        u.email,
        `New First Timer: ${name}`,
        `<p>A new first timer submitted their details.</p>
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
