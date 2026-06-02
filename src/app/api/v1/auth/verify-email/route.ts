// src/app/api/v1/auth/verify-email/route.ts
// Verifies email address from the token sent in the verification email

import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/db/redis'
import { createServiceClient } from '@/lib/supabase/server'
import { createAccessToken, createRefreshToken } from '@/lib/auth/jwt'
import { welcomeEmail } from '@/lib/notifications/email'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json().catch(() => ({}))

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Look up token in Redis
    const stored = await redis.get(`email_verify:${token}`)
    if (!stored) {
      return NextResponse.json(
        { error: 'This verification link has expired or already been used. Please request a new one.' },
        { status: 400 }
      )
    }

    const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored
    const { userId, email } = parsed

    // Delete token - one time use
    await redis.del(`email_verify:${token}`)

    const supabase = createServiceClient()

    // Activate the user account
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)
      .select('id, email, role, is_active')
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get member name for welcome email
    const { data: member } = await supabase
      .from('members')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    // Send welcome email
    if (member) {
      try {
        await welcomeEmail(email, member.first_name)
      } catch (e) {
        console.error('[verify-email] welcome email error:', e)
      }
    }

    // Issue JWT - auto-login after verification
    const accessToken  = createAccessToken(user.id, user.role as any)
    const refreshToken = createRefreshToken(user.id)

    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        id:    user.id,
        email: user.email,
        role:  user.role,
        name:  member ? `${member.first_name} ${member.last_name}`.trim() : 'Member',
      },
      accessToken,
    })

    response.cookies.set('swgga_refresh', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
    })

    return response

  } catch (error) {
    console.error('[verify-email] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
