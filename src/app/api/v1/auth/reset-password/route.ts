// src/app/api/v1/auth/reset-password/route.ts
// Validates reset token and updates password
// Token consumed on first use (one-time only)

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.token || !body?.password) {
    return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
  }

  const { token, password } = body

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: 'Password must contain at least one letter and one number' },
      { status: 400 }
    )
  }

  // Validate token from Redis
  const raw = await redis.get(`password_reset:${token}`)
  if (!raw) {
    return NextResponse.json(
      { error: 'This link has expired or is invalid. Please request a new reset link.' },
      { status: 400 }
    )
  }

  const { userId, isAdmin } = typeof raw === 'string' ? JSON.parse(raw) : raw as any

  const supabase      = await createServiceClient()
  const password_hash = await bcrypt.hash(password, 12)

  const { error } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('id', userId)

  if (error) {
    console.error('[reset-password POST]', error.message)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }

  // Consume token - one-time use only
  await redis.del(`password_reset:${token}`)

  return NextResponse.json({ success: true, isAdmin })
}
