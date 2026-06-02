// src/app/api/v1/auth/change-password/route.ts
// Authenticated password change - requires current password verification

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.current_password || !body?.new_password) {
    return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
  }

  const { current_password, new_password } = body

  if (new_password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (!/[a-zA-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
    return NextResponse.json(
      { error: 'Password must contain at least one letter and one number' },
      { status: 400 }
    )
  }

  if (current_password === new_password) {
    return NextResponse.json(
      { error: 'New password must be different from current password' },
      { status: 400 }
    )
  }

  const supabase = await createServiceClient()

  // Fetch current password hash
  const { data: user, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Verify current password
  const valid = await bcrypt.compare(current_password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  // Hash and save new password
  const password_hash = await bcrypt.hash(new_password, 12)

  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('id', userId)

  if (updateError) {
    console.error('[auth/change-password]', updateError.message)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
