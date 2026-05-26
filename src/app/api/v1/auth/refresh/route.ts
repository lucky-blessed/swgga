// src/app/api/v1/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, createAccessToken, createRefreshToken } from '@/lib/auth/jwt'
import { createServiceClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'
import type { Role } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    // Read refresh token from HTTP-only cookie
    const refreshToken = request.cookies.get('swgga_refresh')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify the refresh token signature
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Check if this refresh token has been blacklisted (used after logout)
    const blacklisted = await redis.get(`jwt_blacklist:${payload.jti}`)
    if (blacklisted) {
      return NextResponse.json(
        { error: 'Token has been revoked' },
        { status: 401 }
      )
    }

    // Blacklist the old refresh token immediately — one time use
    const oldPayload = payload as any
    const ttl = oldPayload.exp
      ? oldPayload.exp - Math.floor(Date.now() / 1000)
      : 60 * 60 * 24 * 30
    if (ttl > 0) {
      await redis.set(`jwt_blacklist:${payload.jti}`, '1', { ex: ttl })
    }

    // Fetch current user from DB to get latest role
    const supabase = createServiceClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', payload.sub)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      )
    }

    // Issue new access token + rotate refresh token
    const newAccessToken  = createAccessToken(user.id, user.role as Role)
    const newRefreshToken = createRefreshToken(user.id)

    const response = NextResponse.json({
      success:     true,
      accessToken: newAccessToken,
      user: {
        id:    user.id,
        email: user.email,
        role:  user.role,
      },
    })

    // Set new refresh token cookie
    response.cookies.set('swgga_refresh', newRefreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
    })

    return response

  } catch (error) {
    console.error('[auth/refresh] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}