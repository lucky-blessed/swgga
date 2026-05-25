// src/app/api/v1/admin/giving/summary/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/db/redis'

const ALLOWED_ROLES = ['R01', 'R02', 'R04']

const FUND_TYPES = ['tithe', 'offering', 'special_project', 'cty', 'healing_streams']

const FUND_LABELS: Record<string, string> = {
  tithe:            'Tithe',
  offering:         'Offering',
  special_project:  'Special Project',
  cty:              'CTY',
  healing_streams:  'Healing Streams',
}

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const from = searchParams.get('from') ?? ''
  const to   = searchParams.get('to')   ?? ''

  // Cache key includes date range
  const cacheKey = `admin:giving:summary:${from}:${to}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) return NextResponse.json(JSON.parse(cached as string))
  } catch {}

  const supabase = await createClient()

  let query = supabase
    .from('giving_transactions')
    .select('amount, fund_type, currency')
    .eq('status', 'success')

  if (from) query = query.gte('created_at', from)
  if (to)   query = query.lte('created_at', to + 'T23:59:59')

  const { data, error } = await query

  if (error) {
    console.error('[admin/giving/summary GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }

  // Group by fund type
  const totals: Record<string, number> = {}
  FUND_TYPES.forEach(f => { totals[f] = 0 })

  let grandTotal = 0
  ;(data ?? []).forEach((t: any) => {
    const amount = parseFloat(t.amount) || 0
    if (totals[t.fund_type] !== undefined) {
      totals[t.fund_type] += amount
    }
    grandTotal += amount
  })

  const summary = {
    grand_total:  grandTotal,
    currency:     'NGN',
    by_fund_type: FUND_TYPES.map(f => ({
      fund_type: f,
      label:     FUND_LABELS[f],
      total:     totals[f],
      count:     (data ?? []).filter((t: any) => t.fund_type === f).length,
    })),
    transaction_count: (data ?? []).length,
    last_updated:      new Date().toISOString(),
  }

  // Cache for 5 minutes
  try {
    await redis.set(cacheKey, JSON.stringify(summary), { ex: 300 })
  } catch {}

  return NextResponse.json(summary)
}