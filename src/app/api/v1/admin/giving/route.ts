// src/app/api/v1/admin/giving/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userHasPermission } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['R01', 'R02', 'R04']

const FUND_TYPES      = ['tithe', 'offering', 'special_project', 'cty', 'healing_streams']
const PAYMENT_METHODS = ['bank_transfer', 'ussd', 'cash', 'card', 'flutterwave']
const STATUSES        = ['success', 'failed', 'pending']

function generateRef(): string {
  const year   = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SW-${year}-${random}`
}

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')
  const allowed = await userHasPermission(userId ?? '', role ?? '', ALLOWED_ROLES, 'FINANCIAL_ACCESS')
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const search         = searchParams.get('search')?.trim()         ?? ''
  const fund_type      = searchParams.get('fund_type')              ?? 'all'
  const payment_method = searchParams.get('payment_method')         ?? 'all'
  const status         = searchParams.get('status')                 ?? 'all'
  const from           = searchParams.get('from')                   ?? ''
  const to             = searchParams.get('to')                     ?? ''
  const page           = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit          = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const offset         = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('giving_transactions')
    .select(`
      id, amount, currency, fund_type, payment_method,
      transaction_ref, status, receipt_sent, created_at,
      member:users!giving_transactions_member_id_fkey (
        id, email, phone,
        members ( first_name, last_name )
      ),
      recorder:users!giving_transactions_recorded_by_fkey (
        id,
        members ( first_name, last_name )
      )
    `, { count: 'exact' })

  if (fund_type      !== 'all') query = query.eq('fund_type',      fund_type)
  if (payment_method !== 'all') query = query.eq('payment_method', payment_method)
  if (status         !== 'all') query = query.eq('status',         status)
  if (from)                     query = query.gte('created_at',    from)
  if (to)                       query = query.lte('created_at',    to + 'T23:59:59')

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/giving GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch giving records' }, { status: 500 })
  }

  const transactions = (data ?? []).map((t: any) => {
    const mm = t.member?.members   as any
    const rm = t.recorder?.members as any
    return {
      id:              t.id,
      amount:          t.amount,
      currency:        t.currency,
      fund_type:       t.fund_type,
      payment_method:  t.payment_method,
      transaction_ref: t.transaction_ref,
      status:          t.status,
      receipt_sent:    t.receipt_sent,
      created_at:      t.created_at,
      member: t.member ? {
        id:    t.member.id,
        email: t.member.email,
        phone: t.member.phone,
        name:  mm ? `${mm.first_name} ${mm.last_name}`.trim() : 'Unknown',
      } : null,
      recorded_by: t.recorder ? {
        id:   t.recorder.id,
        name: rm ? `${rm.first_name} ${rm.last_name}`.trim() : 'Unknown',
      } : null,
    }
  })

  return NextResponse.json({
    transactions,
    total:  count ?? 0,
    page,
    limit,
    pages:  Math.ceil((count ?? 0) / limit),
  })
}

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  const _uid = req.headers.get("x-user-id")
  if (!(await userHasPermission(_uid ?? "", role ?? "", ALLOWED_ROLES, "FINANCIAL_ACCESS"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => null)

  if (!body?.amount || !body?.fund_type || !body?.payment_method) {
    return NextResponse.json(
      { error: 'amount, fund_type, and payment_method are required' },
      { status: 400 }
    )
  }

  if (!FUND_TYPES.includes(body.fund_type)) {
    return NextResponse.json({ error: 'Invalid fund_type' }, { status: 400 })
  }

  if (!PAYMENT_METHODS.includes(body.payment_method)) {
    return NextResponse.json({ error: 'Invalid payment_method' }, { status: 400 })
  }

  if (typeof body.amount !== 'number' || body.amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('giving_transactions')
    .insert({
      member_id:       body.member_id       ?? null,
      amount:          body.amount,
      currency:        body.currency        ?? 'NGN',
      fund_type:       body.fund_type,
      payment_method:  body.payment_method,
      transaction_ref: body.transaction_ref ?? generateRef(),
      status:          body.status          ?? 'success',
      recorded_by:     userId,
      receipt_sent:    false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Transaction reference already exists' },
        { status: 409 }
      )
    }
    console.error('[admin/giving POST]', error.message)
    return NextResponse.json({ error: 'Failed to record giving' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'RECORD_GIVING',
    resource_type: 'giving_transaction',
    resource_id:   data.id,
  })

  return NextResponse.json({ transaction: data }, { status: 201 })
}