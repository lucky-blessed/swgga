// src/app/api/v1/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { createServiceClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'
import { sendVerificationEmail } from '@/lib/notifications/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie or header
    const authHeader = req.headers.get('authorization')
    const token =
      authHeader?.replace('Bearer ', '') ??
      req.cookies.get('swgga_access')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { data: user } = await supabase
      .from('users')
      .select('id, email, is_active')
      .eq('id', payload.sub)
      .single()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'No email address on this account' },
        { status: 400 }
      )
    }

    if (user.is_active) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Rate limit — max 3 resends per hour
    const rateLimitKey = `resend_verify:${user.id}`
    const attempts = await redis.incr(rateLimitKey)
    if (attempts === 1) await redis.expire(rateLimitKey, 3600)
    if (attempts > 3) {
      return NextResponse.json(
        { error: 'Too many resend attempts. Please try again in 1 hour.' },
        { status: 429 }
      )
    }

    // Get member name
    const { data: member } = await supabase
      .from('members')
      .select('first_name')
      .eq('id', user.id)
      .single()

    // Generate new token
    const newToken = crypto.randomBytes(32).toString('hex')
    await redis.set(
      `email_verify:${newToken}`,
      { userId: user.id, email: user.email },
      { ex: 60 * 60 * 24 }
    )

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/verify-email?token=${newToken}`

    await sendVerificationEmail(
      user.email,
      member?.first_name ?? 'Member',
      verifyUrl
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[resend-verification] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
