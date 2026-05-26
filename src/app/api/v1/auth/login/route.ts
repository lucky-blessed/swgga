// src/app/api/v1/auth/login/route.ts
// Handles email and password login
// Returns a JWT access token and sets a refresh token cookie

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/server'
import { createAccessToken, createRefreshToken } from '@/lib/auth/jwt'
import { redis } from '@/lib/db/redis'
import { AUTH_CONFIG } from '@/lib/auth/config'
import type { Role } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if account is locked due to too many failed attempts
    const lockKey = `login_lock:${email}`
    const isLocked = await redis.get(lockKey)
    if (isLocked) {
      return NextResponse.json(
        { error: 'Account temporarily locked. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const supabase = createServiceClient()

    // Find the user by email in our users table
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, role, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      await recordFailedAttempt(email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check account is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is not active. Please contact the church admin.' },
        { status: 403 }
      )
    }

    // Verify password against the stored bcrypt hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      await recordFailedAttempt(email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Clear failed attempts on successful login
    await redis.del(`login_attempts:${email}`)

    // Generate tokens
    const accessToken  = createAccessToken(user.id, user.role as Role)
    const refreshToken = createRefreshToken(user.id)

    // Set refresh token as HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
    })

    response.cookies.set('swgga_refresh', refreshToken, {
      httpOnly: true,   // not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Records a failed login attempt and locks the account after 3 failures
async function recordFailedAttempt(email: string) {
  const attemptsKey = `login_attempts:${email}`
  const attempts = await redis.incr(attemptsKey)
  await redis.expire(attemptsKey, 60 * 15) // expires in 15 minutes

  if (attempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const lockKey = `login_lock:${email}`
    await redis.set(lockKey, '1', { ex: 60 * AUTH_CONFIG.LOCKOUT_DURATION_MINUTES })
  }
}