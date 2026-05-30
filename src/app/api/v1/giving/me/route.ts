// src/app/api/v1/giving/route.ts
// Member-facing giving API — authenticated members see only their own records

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_FUND_TYPES = ['tithe', 'offering', 'special_project', 'cty', 'healing_streams']

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const fund_type = searchParams.get('fund_type') ?? 'all'
  const from      = searchParams.get('from')      ?? ''
  const to        = searchParams.get('to')        ?? ''
  const page      = Math.max(1,  parseInt(searchParams.get('page')  ?? '1'))
  const limit     = Math.min(20, parseInt(searchParams.get('limit') ?? '10'))
  const offset    = (page - 1) * limit

  const supabase = await createServiceClient()

  let query = supabase
    .from('giving_transactions')
    .select(`
      id, amount, currency, fund_type,
      payment_method, transaction_ref,
      status, receipt_sent, created_at
    `, { count: 'exact' })
    .eq('member_id', userId)
    .eq('status', 'success')

  if (fund_type !== 'all' && VALID_FUND_TYPES.includes(fund_type)) {
    query = query.eq('fund_type', fund_type)
  }
  if (from) query = query.gte('created_at', from)
  if (to)   query = query.lte('created_at', to + 'T23:59:59')

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[api/v1/giving GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch giving records' }, { status: 500 })
  }

  // Compute summary totals across all records (not just current page)
  const { data: allData } = await supabase
    .from('giving_transactions')
    .select('amount, fund_type')
    .eq('member_id', userId)
    .eq('status', 'success')

  const summary = {
    total:           0,
    by_fund:         {} as Record<string, number>,
  }

  for (const t of allData ?? []) {
    summary.total += Number(t.amount)
    summary.by_fund[t.fund_type] = (summary.by_fund[t.fund_type] ?? 0) + Number(t.amount)
  }

  return NextResponse.json({
    transactions: data ?? [],
    summary,
    total:  count ?? 0,
    page,
    limit,
    pages:  Math.ceil((count ?? 0) / limit),
  })
}
