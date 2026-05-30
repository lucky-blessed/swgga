// src/app/api/v1/members/cell-group/route.ts
// Returns the authenticated member's Impact Fellowship details

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Get cell_group_id from users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('cell_group_id')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    console.error('[members/cell-group GET]', userError?.message)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.cell_group_id) {
    return NextResponse.json({ cell_group: null })
  }

  // Fetch Impact Fellowship details with leader info
  const { data: cellGroup, error: cgError } = await supabase
    .from('cell_groups')
    .select(`
      id, name, location, meeting_day, is_active, created_at,
      leader:users!cell_groups_leader_id_fkey (
        id, email, phone,
        members ( first_name, last_name )
      )
    `)
    .eq('id', user.cell_group_id)
    .single()

  if (cgError || !cellGroup) {
    console.error('[members/cell-group GET]', cgError?.message)
    return NextResponse.json({ cell_group: null })
  }

  const leader = cellGroup.leader as any
  const lm     = leader?.members as any

  return NextResponse.json({
    cell_group: {
      id:          cellGroup.id,
      name:        cellGroup.name,
      location:    cellGroup.location,
      meeting_day: cellGroup.meeting_day,
      is_active:   cellGroup.is_active,
      created_at:  cellGroup.created_at,
      leader: leader ? {
        id:    leader.id,
        name:  lm ? `${lm.first_name} ${lm.last_name}`.trim() : 'Unknown',
        email: leader.email,
        phone: leader.phone,
      } : null,
    },
  })
}
