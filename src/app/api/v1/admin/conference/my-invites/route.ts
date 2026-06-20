// src/app/api/v1/admin/conference/my-invites/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const now      = new Date().toISOString()

  const { data, error } = await supabase
    .from('conference_participants')
    .select(`
      id, joined_at,
      meeting:conference_meetings!conference_participants_meeting_id_fkey (
        id, title, scheduled_time, duration_minutes, status,
        created_by,
        creator:users!conference_meetings_created_by_fkey (
          id, members ( first_name, last_name )
        )
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('[conference/my-invites]', error.message)
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
  }

  const invites = (data ?? [])
    .map((row: any) => row.meeting)
    .filter((m: any) =>
      m &&
      m.created_by !== userId &&                      // exclude meetings the user scheduled
      ['scheduled', 'in_progress'].includes(m.status) &&
      m.scheduled_time >= new Date(Date.now() - 30 * 60 * 1000).toISOString() // include 30min grace after start
    )
    .map((m: any) => {
      const creatorMember = m.creator?.members as any
      return {
        id:               m.id,
        title:            m.title,
        scheduled_time:   m.scheduled_time,
        duration_minutes: m.duration_minutes,
        status:           m.status,
        invited_by: creatorMember
          ? `${creatorMember.first_name} ${creatorMember.last_name}`.trim()
          : 'Leadership',
      }
    })
    .sort((a: any, b: any) =>
      new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
    )

  console.log("[my-invites] userId:", userId, "returning:", invites.length, JSON.stringify(invites.map((i:any)=>({id:i.id,title:i.title,scheduled_time:i.scheduled_time,status:i.status}))))
  return NextResponse.json({ invites })
}