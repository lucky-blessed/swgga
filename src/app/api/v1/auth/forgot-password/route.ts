// src/app/api/v1/auth/forgot-password/route.ts
// Generates a password reset token and sends reset email
// Works for both portal members and admin accounts

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'
import { sendEmail } from '@/lib/notifications/email'

async function sendResetEmail(
  to: string,
  firstName: string,
  resetUrl: string,
  isAdmin: boolean
) {
  const platformLabel = isAdmin ? 'Admin Platform' : 'Member Portal'
  const loginUrl = isAdmin
    ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`
    : `${process.env.NEXT_PUBLIC_APP_URL}/portal/login`

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Reset Your Password - Sure Word Glorious Gospel Assembly</title></head>
    <body style="margin:0;padding:0;background:#F3F4F6;">
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#0D1B2A 0%,#1E3A8A 100%);padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Sure Word Glorious Gospel Assembly</h1>
          <p style="color:#93C5FD;margin:6px 0 0;font-size:13px;">${platformLabel}</p>
        </div>
        <div style="padding:40px;color:#374151;line-height:1.6;">
          <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:22px;">
            Reset your password, ${firstName}
          </h2>
          <p style="margin:0 0 16px;">
            We received a request to reset the password for your Sure Word Glorious Gospel Assembly account.
            Click the button below to choose a new password.
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#EF4444;font-weight:600;">
            This link expires in 1 hour.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;background:#1E3A8A;color:#ffffff;text-decoration:none;
                      padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
              Reset My Password
            </a>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">
            If you did not request a password reset, you can safely ignore this email.
            Your password will not be changed.
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">
            Link not working? Copy and paste:<br>
            <a href="${resetUrl}" style="color:#1E3A8A;word-break:break-all;">${resetUrl}</a>
          </p>
        </div>
        <div style="background:#F9FAFB;padding:24px 40px;text-align:center;
                    color:#9CA3AF;font-size:12px;border-top:1px solid #E5E7EB;">
          <p style="margin:0 0 4px;">Sure Word Glorious Gospel Assembly · Warri, Delta State, Nigeria</p>
          <p style="margin:0;">
            If you need help, contact us at
            <a href="mailto:info@surewordgga.org" style="color:#1E3A8A;">info@surewordgga.org</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail(to, 'Reset your Sure Word Glorious Gospel Assembly password', html)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.email?.trim()) {
    return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()

  const supabase = await createServiceClient()

  // Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role, is_active')
    .eq('email', email)
    .single()

  // Always return success even if email not found - prevents email enumeration
  if (error || !user || !user.is_active) {
    return NextResponse.json({ success: true })
  }

  // Rate limit - max 3 reset requests per hour per email
  const rateLimitKey = `reset_rate:${email}`
  const attempts = await redis.incr(rateLimitKey)
  if (attempts === 1) await redis.expire(rateLimitKey, 3600)
  if (attempts > 3) {
    return NextResponse.json({ success: true }) // Silent rate limit
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex')
  const isAdmin = !['R10', 'R11'].includes(user.role)

  // Store in Redis with 1hr TTL
  await redis.set(
    `password_reset:${token}`,
    JSON.stringify({ userId: user.id, email: user.email, isAdmin }),
    { ex: 60 * 60 }
  )

  // Build reset URL
  const resetPath = isAdmin ? '/admin/reset-password' : '/portal/reset-password'
  const resetUrl  = `${process.env.NEXT_PUBLIC_APP_URL}${resetPath}?token=${token}`

  // Fetch member name
  const { data: member } = await supabase
    .from('members')
    .select('first_name')
    .eq('id', user.id)
    .single()

  const firstName = member?.first_name ?? 'Member'

  try {
    await sendResetEmail(email, firstName, resetUrl, isAdmin)
  } catch (emailErr) {
    console.error('[forgot-password] email error:', emailErr)
  }

  return NextResponse.json({ success: true })
}
