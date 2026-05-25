// src/hooks/admin/useGiving.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FundType      = 'tithe' | 'offering' | 'special_project' | 'cty' | 'healing_streams'
export type PaymentMethod = 'bank_transfer' | 'ussd' | 'cash' | 'card' | 'flutterwave'
export type GivingStatus  = 'success' | 'failed' | 'pending'

export interface GivingMember {
  id:      string
  email:   string | null
  phone:   string | null
  name:    string
  address?: string | null
}

export interface GivingTransaction {
  id:              string
  amount:          number
  currency:        string
  fund_type:       FundType
  payment_method:  PaymentMethod
  transaction_ref: string | null
  status:          GivingStatus
  receipt_sent:    boolean
  created_at:      string
  member:          GivingMember | null
  recorded_by:     { id: string; name: string } | null
}

export interface GivingFilters {
  search?:         string
  fund_type?:      FundType | 'all'
  payment_method?: PaymentMethod | 'all'
  status?:         GivingStatus | 'all'
  from?:           string
  to?:             string
  page?:           number
  limit?:          number
}

export interface CreateGivingPayload {
  member_id?:      string | null
  amount:          number
  currency?:       string
  fund_type:       FundType
  payment_method:  PaymentMethod
  transaction_ref?: string | null
  status?:         GivingStatus
}

export interface GivingSummaryItem {
  fund_type: FundType
  label:     string
  total:     number
  count:     number
}

export interface GivingSummary {
  grand_total:       number
  currency:          string
  by_fund_type:      GivingSummaryItem[]
  transaction_count: number
  last_updated:      string
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const FUND_TYPE_LABELS: Record<FundType, string> = {
  tithe:           'Tithe',
  offering:        'Offering',
  special_project: 'Special Project',
  cty:             'CTY',
  healing_streams: 'Healing Streams',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  ussd:          'USSD',
  cash:          'Cash',
  card:          'Card',
  flutterwave:   'Flutterwave',
}

export const FUND_TYPE_COLORS: Record<FundType, string> = {
  tithe:           'text-blue-400 bg-blue-400/10 border-blue-400/20',
  offering:        'text-green-400 bg-green-400/10 border-green-400/20',
  special_project: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  cty:             'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  healing_streams: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchTransactions(filters: GivingFilters) {
  const params = new URLSearchParams()
  if (filters.fund_type && filters.fund_type !== 'all')
    params.set('fund_type', filters.fund_type)
  if (filters.payment_method && filters.payment_method !== 'all')
    params.set('payment_method', filters.payment_method)
  if (filters.status && filters.status !== 'all')
    params.set('status', filters.status)
  if (filters.from)  params.set('from',  filters.from)
  if (filters.to)    params.set('to',    filters.to)
  params.set('page',  String(filters.page  ?? 1))
  params.set('limit', String(filters.limit ?? 20))

  const res = await fetch(`/api/v1/admin/giving?${params}`)
  if (!res.ok) throw new Error('Failed to fetch giving records')
  return res.json()
}

async function fetchSummary(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to)   params.set('to',   to)
  const res = await fetch(`/api/v1/admin/giving/summary?${params}`)
  if (!res.ok) throw new Error('Failed to fetch giving summary')
  return res.json()
}

async function createTransaction(payload: CreateGivingPayload) {
  const res = await fetch('/api/v1/admin/giving', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to record giving')
  }
  return res.json()
}

async function updateTransaction({ id, ...payload }: { id: string; status?: GivingStatus; receipt_sent?: boolean }) {
  const res = await fetch(`/api/v1/admin/giving/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to update record')
  }
  return res.json()
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGivingTransactions(filters: GivingFilters = {}) {
  return useQuery({
    queryKey: ['giving', filters],
    queryFn:  () => fetchTransactions(filters),
  })
}

export function useGivingSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['giving-summary', from, to],
    queryFn:  () => fetchSummary(from, to),
  })
}

export function useCreateGiving() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giving'] })
      queryClient.invalidateQueries({ queryKey: ['giving-summary'] })
    },
  })
}

export function useUpdateGiving() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giving'] })
      queryClient.invalidateQueries({ queryKey: ['giving-summary'] })
    },
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style:    'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportGivingToCSV(transactions: GivingTransaction[]) {
  const headers = [
    'Date', 'Reference', 'Member', 'Amount', 'Currency',
    'Fund Type', 'Payment Method', 'Status', 'Receipt Sent', 'Recorded By',
  ]

  const rows = transactions.map(t => [
    new Date(t.created_at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }),
    t.transaction_ref  ?? '',
    t.member?.name     ?? 'Anonymous',
    t.amount,
    t.currency,
    FUND_TYPE_LABELS[t.fund_type],
    PAYMENT_METHOD_LABELS[t.payment_method],
    t.status,
    t.receipt_sent ? 'Yes' : 'No',
    t.recorded_by?.name ?? '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `swgga-giving-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}