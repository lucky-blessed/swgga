// src/app/api/v1/admin/charts/route.ts
// Returns last 30 days of attendance and giving data for dashboard charts
// Cached in Redis for 10 minutes

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'
import { format, subDays, eachDayOfInterval } from 'date-fns'

const CACHE_KEY = 'admin:dashboard:charts'
const CACHE_TTL = 600 // 10 minutes

export async function GET() {
  try {
    const cached = await redis.get(CACHE_KEY)
    if (cached) return NextResponse.json(JSON.parse(cached as string))

    const supabase  = await createClient()
    const today     = new Date()
    const thirtyAgo = subDays(today, 29)

    // Build array of last 30 days
    const days = eachDayOfInterval({ start: thirtyAgo, end: today })

    const [attendanceResult, givingResult] = await Promise.all([
      supabase.from('service_records')
        .select('service_date, total_count')
        .gte('service_date', format(thirtyAgo, 'yyyy-MM-dd')),
      supabase.from('giving_transactions')
        .select('amount, created_at')
        .gte('service_date', format(thirtyAgo, 'yyyy-MM-dd')),
    ])

    // Group by day
    const attendanceByDay: Record<string, number> = {}
    const givingByDay: Record<string, number> = {};

    (attendanceResult.data || []).forEach((r: any) => {
      const day = format(new Date(r.service_date), 'MMM dd')
      attendanceByDay[day] = (attendanceByDay[day] || 0) + (r.total_count || 0)
    });

    (givingResult.data || []).forEach((r: any) => {
      const day = format(new Date(r.created_at), 'MMM dd')
      givingByDay[day] = (givingByDay[day] || 0) + (r.amount || 0)
    })

    // Merge into chart-ready format
    const chartData = days.map(day => {
      const label = format(day, 'MMM dd')
      return {
        date:       label,
        attendance: attendanceByDay[label] || 0,
        giving:     givingByDay[label]     || 0,
      }
    })

    const data = { chartData, lastUpdated: today.toISOString() }
    await redis.set(CACHE_KEY, JSON.stringify(data), { ex: CACHE_TTL })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[admin/charts] Error:', error)
    return NextResponse.json({ chartData: [], lastUpdated: new Date().toISOString() })
  }
}
