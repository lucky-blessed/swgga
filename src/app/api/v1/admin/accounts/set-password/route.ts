// src/app/api/v1/admin/accounts/set-password/route.ts
// Validates set-password token, updates password, activates account

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

  // Validate token
  const raw = await redis.get(`admin_set_password:${token}`)
  if (!raw) {
    return NextResponse.json(
      { error: 'This link has expired or is invalid. Please contact your administrator.' },
      { status: 400 }
    )
  }

  const { userId } = typeof raw === 'string' ? JSON.parse(raw) : raw as any

  const supabase      = await createServiceClient()
  const password_hash = await bcrypt.hash(password, 12)

  const { error } = await supabase
    .from('users')
    .update({ password_hash, is_active: true })
    .eq('id', userId)

  if (error) {
    console.error('[admin/set-password POST]', error.message)
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
  }

  // Consume token and clear pending flag
  await redis.del(`admin_set_password:${token}`)
  await redis.del(`admin_password_pending:${userId}`)

  return NextResponse.json({ success: true })
}
