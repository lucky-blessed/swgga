// src/app/api/v1/members/me/route.ts
// Member's own profile — GET details, PATCH update

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = ['first_name', 'last_name', 'address', 'occupation', 'marital_status']
const VALID_MARITAL  = ['single', 'married', 'widowed', 'divorced']

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('members')
    .select(`
      id, first_name, last_name, date_of_birth,
      address, marital_status, occupation,
      baptism_date, joined_date, membership_status,
      last_attendance_date
    `)
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('[members/me GET]', error?.message)
    return NextResponse.json({ error: 'Member record not found' }, { status: 404 })
  }

  return NextResponse.json({ member: data })
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Only allow safe member-editable fields
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_FIELDS.includes(k))
  )

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // Validate marital_status if provided
  if (update.marital_status && !VALID_MARITAL.includes(update.marital_status as string)) {
    return NextResponse.json({ error: 'Invalid marital status' }, { status: 400 })
  }

  // Trim string fields
  for (const key of Object.keys(update)) {
    if (typeof update[key] === 'string') {
      update[key] = (update[key] as string).trim()
    }
  }

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('members')
    .update(update)
    .eq('id', userId)

  if (error) {
    console.error('[members/me PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
