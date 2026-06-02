// src/app/api/v1/admin/accounts/route.ts
// Admin account management - R01 and R02 only
// POST: create a new admin account and send set-password email
// GET:  list all admin accounts with password setup status

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'
import { sendEmail } from '@/lib/notifications/email'

const CREATOR_ROLES  = ['R01', 'R02']
const ASSIGNABLE_BY_R02 = ['R02','R03','R04','R05','R06','R07','R08','R09']
const ASSIGNABLE_BY_R01 = ['R01','R02','R03','R04','R05','R06','R07','R08','R09']

const ROLE_LABELS: Record<string, string> = {
  R01: 'Super Admin',       R02: 'Senior Pastor',
  R03: 'Admin / Secretary', R04: 'Treasurer',
  R05: 'Department Head',   R06: 'CTY Admin',
  R07: 'Media / Tech Lead', R08: 'Prayer Coordinator',
  R09: 'Cell / Impact Leader',
}

async function sendAdminWelcomeEmail(
  to: string,
  firstName: string,
  roleLabel: string,
  creatorName: string,
  setPasswordUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Admin Account - Sure Word Glorious Gospel Assembly</title></head>
    <body style="margin:0;padding:0;background:#F3F4F6;">
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#0D1B2A 0%,#1E3A8A 100%);padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Sure Word Glorious Gospel Assembly</h1>
          <p style="color:#93C5FD;margin:6px 0 0;font-size:13px;">Admin Platform Access</p>
        </div>
        <div style="padding:40px;color:#374151;line-height:1.6;">
          <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:22px;">Welcome, ${firstName}!</h2>
          <p style="margin:0 0 16px;">
            An admin account has been created for you on the Sure Word Glorious Gospel Assembly digital platform by
            <strong>${creatorName}</strong>.
          </p>
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:0 0 24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#6B7280;font-size:14px;">Email</td>
                <td style="padding:8px 0;text-align:right;color:#1A1A1A;font-size:14px;">${to}</td>
              </tr>
              <tr style="border-top:1px solid #E5E7EB;">
                <td style="padding:8px 0;color:#6B7280;font-size:14px;">Role</td>
                <td style="padding:8px 0;text-align:right;color:#1A1A1A;font-size:14px;font-weight:600;">${roleLabel}</td>
              </tr>
              <tr style="border-top:1px solid #E5E7EB;">
                <td style="padding:8px 0;color:#6B7280;font-size:14px;">Platform</td>
                <td style="padding:8px 0;text-align:right;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" style="color:#1E3A8A;">
                    swgga.vercel.app/admin/login
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <p style="margin:0 0 8px;font-weight:600;color:#1A1A1A;">Next steps:</p>
          <ol style="margin:0 0 24px;padding-left:20px;color:#374151;">
            <li style="margin-bottom:8px;">Click the button below to set your password</li>
            <li style="margin-bottom:8px;">Sign in at <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" style="color:#1E3A8A;">swgga.vercel.app/admin/login</a></li>
            <li style="margin-bottom:8px;">Keep your credentials confidential</li>
          </ol>
          <p style="margin:0 0 16px;font-size:13px;color:#EF4444;font-weight:600;">
            This link expires in 24 hours.
          </p>
          <div style="text-align:center;">
            <a href="${setPasswordUrl}"
               style="display:inline-block;background:#1E3A8A;color:#ffffff;text-decoration:none;
                      padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 24px;">
              Set Your Password
            </a>
          </div>
          <p style="margin:0;font-size:13px;color:#6B7280;">
            If you did not expect this email, please contact Rev. Chijioke Igbani immediately.
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">
            Link not working? Copy and paste:<br>
            <a href="${setPasswordUrl}" style="color:#1E3A8A;word-break:break-all;">${setPasswordUrl}</a>
          </p>
        </div>
        <div style="background:#F9FAFB;padding:24px 40px;text-align:center;color:#9CA3AF;font-size:12px;border-top:1px solid #E5E7EB;">
          <p style="margin:0 0 4px;">Sure Word Glorious Gospel Assembly</p>
          <p style="margin:0;">Warri, Delta State, Nigeria</p>
        </div>
      </div>
    </body>
    </html>
  `
  await sendEmail(to, 'Your Sure Word Glorious Gospel Assembly Admin Account', html)
}

export async function POST(req: NextRequest) {
  const actorRole = req.headers.get('x-user-role')
  const actorId   = req.headers.get('x-user-id')

  if (!actorRole || !CREATOR_ROLES.includes(actorRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const { first_name, last_name, email, phone, role, custom_role } = body

  if (!first_name?.trim() || !last_name?.trim()) {
    return NextResponse.json({ error: 'First and last name are required' }, { status: 400 })
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required for admin accounts' }, { status: 400 })
  }
  if (!role) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 })
  }

  // Determine the actual role code to store
  // Custom roles default to R09 permissions
  const isCustomRole = !['R01','R02','R03','R04','R05','R06','R07','R08','R09'].includes(role)
  const roleCode     = isCustomRole ? 'R09' : role
  const roleLabel    = custom_role?.trim() || ROLE_LABELS[roleCode] || roleCode

  // Enforce role assignment rules
  const assignable = actorRole === 'R01' ? ASSIGNABLE_BY_R01 : ASSIGNABLE_BY_R02
  if (!assignable.includes(roleCode)) {
    return NextResponse.json({ error: 'You cannot assign this role' }, { status: 403 })
  }

  const supabase = await createServiceClient()

  // Check email not already taken
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  // Create with temp password - account inactive until password is set
  const tempPassword  = crypto.randomBytes(32).toString('hex')
  const password_hash = await bcrypt.hash(tempPassword, 12)

  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({
      email:         email.toLowerCase().trim(),
      phone:         phone?.trim() ?? null,
      password_hash,
      role:          roleCode,
      is_active:     false, // inactive until password is set
    })
    .select('id, email, role')
    .single()

  if (userErr || !user) {
    console.error('[admin/accounts POST]', userErr?.message)
    if (userErr.code === '23505' && userErr.message.includes('phone')) {
      return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  // Create member profile
  await supabase.from('members').insert({
    id:         user.id,
    first_name: first_name.trim(),
    last_name:  last_name.trim(),
    occupation: custom_role?.trim() || null, // store custom role title in occupation
  })

  // Store set-password token in Redis - 24hr expiry
  const token = crypto.randomBytes(32).toString('hex')
  await redis.set(
    `admin_set_password:${token}`,
    JSON.stringify({ userId: user.id, email: user.email }),
    { ex: 60 * 60 * 24 }
  )

  // Also store a flag that password has NOT been set yet
  await redis.set(`admin_password_pending:${user.id}`, '1', { ex: 60 * 60 * 24 * 7 })

  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/set-password?token=${token}`

  // Fetch creator name
  const { data: creator } = await supabase
    .from('members')
    .select('first_name, last_name')
    .eq('id', actorId)
    .single()

  const creatorName = creator
    ? `${creator.first_name} ${creator.last_name}`.trim()
    : 'Church Administration'

  // Send welcome email
  try {
    await sendAdminWelcomeEmail(
      user.email!,
      first_name.trim(),
      roleLabel,
      creatorName,
      setPasswordUrl
    )
  } catch (emailErr) {
    console.error('[admin/accounts POST] email error:', emailErr)
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id:      actorId,
    action:        'CREATE_ADMIN_ACCOUNT',
    resource_type: 'user',
    resource_id:   user.id,
  })

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role },
  }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const actorRole = req.headers.get('x-user-role')

  if (!actorRole || !CREATOR_ROLES.includes(actorRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .select(`
      id, email, phone, role, is_active, created_at,
      members ( first_name, last_name, occupation )
    `)
    .in('role', ['R01','R02','R03','R04','R05','R06','R07','R08','R09'])
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch admin accounts' }, { status: 500 })
  }

  // Check Redis for pending password flags
  const accounts = await Promise.all((data ?? []).map(async (u: any) => {
    const m = u.members as any
    const isPending = await redis.get(`admin_password_pending:${u.id}`)
    return {
      id:              u.id,
      email:           u.email,
      phone:           u.phone,
      role:            u.role,
      role_label:      m?.occupation || ROLE_LABELS[u.role] || u.role,
      is_active:       u.is_active,
      password_is_set: !isPending && u.is_active,
      name:            m ? `${m.first_name} ${m.last_name}`.trim() : 'Unknown',
      created_at:      u.created_at,
    }
  }))

  return NextResponse.json({ accounts })
}
