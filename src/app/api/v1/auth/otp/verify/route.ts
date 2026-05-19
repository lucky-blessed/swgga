// src/app/api/v1/auth/otp/verify/route.ts
// Verifies the OTP and returns a JWT if valid

import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/db/redis'
import { createClient } from '@/lib/supabase/server'
import { createAccessToken, createRefreshToken } from '@/lib/auth/jwt'
import type { Role } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }
    

    // Retrieve stored OTP from Redis
    const otpKey = `otp:${phone}`
    const storedOtp = await redis.get(otpKey)

    if (!storedOtp) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 401 }
      )
    }

    if (storedOtp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 401 }
      )
    }

    // OTP is valid — delete it so it cannot be reused
    await redis.del(otpKey)

    // Find the user by phone number
    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, role, is_active')
      .eq('phone', phone)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'No account found with this phone number.' },
        { status: 404 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is not active. Please contact the church admin.' },
        { status: 403 }
      )
    }

    // Generate tokens
    const accessToken  = createAccessToken(user.id, user.role as Role)
    const refreshToken = createRefreshToken(user.id)

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, phone: user.phone, role: user.role },
      accessToken,
    })

    response.cookies.set('swgga_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}