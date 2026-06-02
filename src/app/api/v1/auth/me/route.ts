// src/app/api/v1/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { createServiceClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token =
      authHeader?.replace('Bearer ', '') ??
      request.cookies.get('swgga_access')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No access token provided' },
        { status: 401 }
      )
    }

    // Verify token signature
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check blacklist
    const blacklisted = await redis.get(`jwt_blacklist:${payload.jti}`)
    if (blacklisted) {
      return NextResponse.json(
        { error: 'Token has been revoked' },
        { status: 401 }
      )
    }

    // Fetch full user profile
    const supabase = createServiceClient()
    // Fetch user base data
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, phone, role, is_active, created_at, ministry_id, profile_photo_url, word_streak_count')
      .eq('id', payload.sub)
      .single()

    if (error || !user) {
      console.error('[auth/me] user query error:', error?.message)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch member profile separately
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('first_name, last_name, membership_status')
      .eq('id', payload.sub)
      .single()
    if (memberErr) console.error('[auth/me] member error:', memberErr.message)

    // Fetch ministry separately
    const { data: ministry } = user.ministry_id ? await supabase
      .from('ministries')
      .select('id, name, slug')
      .eq('id', user.ministry_id)
      .single() : { data: null }

    // Fetch granted permission overrides
    const { data: permOverrides } = await supabase
      .from('user_permissions')
      .select('permission, granted, revoked_at')
      .eq('user_id', payload.sub)

    const grantedPermissions = (permOverrides ?? [])
      .filter((p: any) => p.granted && !p.revoked_at)
      .map((p: any) => p.permission)

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      )
    }

    const m = member

    return NextResponse.json({
      id:         user.id,
      email:      user.email,
      phone:      user.phone,
      role:       user.role,
      name:       m ? `${m.first_name} ${m.last_name}`.trim() : 'User',
      first_name: m?.first_name ?? null,
      last_name:  m?.last_name  ?? null,
      photo:      (user as any).profile_photo_url ?? null,
      word_streak: (user as any).word_streak_count ?? 0,
      membership_status: m?.membership_status ?? null,
      ministry:   ministry ?? null,
      granted_permissions: grantedPermissions,
      created_at: user.created_at,
    })

  } catch (error) {
    console.error('[auth/me] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}