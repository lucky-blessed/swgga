// src/app/api/v1/admin/giving/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['R01', 'R02', 'R04']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('giving_transactions')
    .select(`
      id, amount, currency, fund_type, payment_method,
      transaction_ref, paystack_ref, flutterwave_ref,
      status, receipt_sent, created_at,
      member:users!giving_transactions_member_id_fkey (
        id, email, phone,
        members ( first_name, last_name, date_of_birth, address )
      ),
      recorder:users!giving_transactions_recorded_by_fkey (
        id,
        members ( first_name, last_name )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  const mm = (data.member as any)?.members as any
  const rm = (data.recorder as any)?.members as any

  return NextResponse.json({
    transaction: {
      id:              data.id,
      amount:          data.amount,
      currency:        data.currency,
      fund_type:       data.fund_type,
      payment_method:  data.payment_method,
      transaction_ref: data.transaction_ref,
      paystack_ref:    data.paystack_ref,
      flutterwave_ref: data.flutterwave_ref,
      status:          data.status,
      receipt_sent:    data.receipt_sent,
      created_at:      data.created_at,
      member: (data.member as any) ? {
        id:    (data.member as any).id,
        email: (data.member as any).email,
        phone: (data.member as any).phone,
        name:  mm ? `${mm.first_name} ${mm.last_name}`.trim() : 'Unknown',
        address: mm?.address ?? null,
      } : null,
      recorded_by: (data.recorder as any) ? {
        id:   (data.recorder as any).id,
        name: rm ? `${rm.first_name} ${rm.last_name}`.trim() : 'Unknown',
      } : null,
    }
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Only status and receipt_sent are mutable — financial records are immutable
  const allowed  = ['status', 'receipt_sent']
  const updates  = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'Only status and receipt_sent can be updated' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('giving_transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/giving PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    actor_id:      userId,
    action:        'UPDATE_GIVING_RECORD',
    resource_type: 'giving_transaction',
    resource_id:   id,
  })

  return NextResponse.json({ transaction: data })
}