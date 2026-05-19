// src/app/api/v1/auth/logout/route.ts
// Blacklists the JWT in Redis so it cannot be reused after logout

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { redis } from '@/lib/db/redis'

export async function POST(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      const payload = verifyAccessToken(token)
      if (payload) {
        // Blacklist the token until it naturally expires
        const ttl = payload.exp - Math.floor(Date.now() / 1000)
        if (ttl > 0) {
          await redis.set(`jwt_blacklist:${payload.jti}`, '1', { ex: ttl })
        }
      }
    }

    // Clear the refresh token cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('swgga_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}