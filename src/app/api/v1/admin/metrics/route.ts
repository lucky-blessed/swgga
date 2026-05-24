// src/app/api/v1/admin/metrics/route.ts
// Admin dashboard metrics — cached in Redis for 5 minutes
// Returns member count, giving total, prayer requests, events

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'

const CACHE_KEY = 'admin:dashboard:metrics'
const CACHE_TTL = 300 // 5 minutes

export async function GET() {
  try {
    // Try Redis cache first
    const cached = await redis.get(CACHE_KEY)
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string))
    }

    const supabase = await createClient()
    const now      = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Run all queries in parallel for speed
    const [
      membersResult,
      givingResult,
      prayerResult,
      eventsResult,
      attendanceResult,
    ] = await Promise.all([
      supabase.from('members').select('id', { count: 'exact', head: true }),
      supabase.from('giving_transactions').select('amount').gte('created_at', monthStart),
      supabase.from('prayer_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('events').select('id', { count: 'exact', head: true }).gte('start_time', now.toISOString()),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    ])

    // Calculate total giving this month
    const givingTotal = (givingResult.data || []).reduce(
      (sum: number, t: any) => sum + (t.amount || 0), 0
    )

    const metrics = {
      totalMembers:    membersResult.count   || 0,
      givingThisMonth: givingTotal,
      pendingPrayers:  prayerResult.count    || 0,
      upcomingEvents:  eventsResult.count    || 0,
      attendanceMonth: attendanceResult.count|| 0,
      lastUpdated:     now.toISOString(),
    }

    // Cache in Redis for 5 minutes
    await redis.set(CACHE_KEY, JSON.stringify(metrics), { ex: CACHE_TTL })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('[admin/metrics] Error:', error)
    // Return zeros on error — dashboard still loads
    return NextResponse.json({
      totalMembers: 0, givingThisMonth: 0, pendingPrayers: 0,
      upcomingEvents: 0, attendanceMonth: 0, lastUpdated: new Date().toISOString(),
    })
  }
}
