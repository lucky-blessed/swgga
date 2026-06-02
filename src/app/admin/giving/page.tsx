// src/app/admin/giving/page.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  Search, Download, Plus, Loader2, RefreshCw,
  ChevronDown, X, DollarSign, TrendingUp,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useGivingTransactions, useGivingSummary, useCreateGiving,
  exportGivingToCSV, formatNaira,
  FUND_TYPE_LABELS, FUND_TYPE_COLORS, PAYMENT_METHOD_LABELS,
  type GivingTransaction, type GivingFilters,
  type CreateGivingPayload, type FundType, type PaymentMethod,
} from '@/hooks/admin/useGiving'

// ─── Constants ────────────────────────────────────────────────────────────────

const FUND_TYPES: { value: FundType | 'all'; label: string }[] = [
  { value: 'all',             label: 'All Funds'       },
  { value: 'tithe',           label: 'Tithe'           },
  { value: 'offering',        label: 'Offering'        },
  { value: 'special_project', label: 'Special Project' },
  { value: 'cty',             label: 'CTY'             },
  { value: 'healing_streams', label: 'Healing Streams' },
]

const PAYMENT_METHODS: { value: PaymentMethod | 'all'; label: string }[] = [
  { value: 'all',           label: 'All Methods'    },
  { value: 'bank_transfer', label: 'Bank Transfer'  },
  { value: 'cash',          label: 'Cash'           },
  { value: 'ussd',          label: 'USSD'           },
  { value: 'card',          label: 'Card'           },
  { value: 'flutterwave',   label: 'Flutterwave'    },
]

const EMPTY_FORM: CreateGivingPayload = {
  member_id:      null,
  amount:         0,
  currency:       'NGN',
  fund_type:      'tithe',
  payment_method: 'cash',
  status:         'success',
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  onClick,
}: {
  tx:      GivingTransaction
  onClick: () => void
}) {
  const color = FUND_TYPE_COLORS[tx.fund_type]

  return (
    <tr
      onClick={onClick}
      className="border-b border-white/5 hover:bg-[#0F1E35] cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 text-[#64748B] text-xs whitespace-nowrap">
        {new Date(tx.created_at).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          timeZone: 'Africa/Lagos',
        })}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border
                          text-xs font-medium ${color}`}>
          {FUND_TYPE_LABELS[tx.fund_type]}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-white text-sm font-semibold">
          {formatNaira(tx.amount)}
        </p>
      </td>
      <td className="px-4 py-3 text-[#64748B] text-sm">
        {tx.member?.name ?? <span className="text-[#334155] italic">Anonymous</span>}
      </td>
      <td className="px-4 py-3 text-[#64748B] text-xs">
        {PAYMENT_METHOD_LABELS[tx.payment_method]}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg
                          ${tx.status === 'success'
                            ? 'bg-green-400/10 text-green-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-red-400/10 text-red-400'
                          }`}>
          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3 text-[#334155] text-xs font-mono">
        {tx.transaction_ref ?? '—'}
      </td>
    </tr>
  )
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────

function TransactionModal({
  tx,
  onClose,
}: {
  tx:      GivingTransaction
  onClose: () => void
}) {
  const color = FUND_TYPE_COLORS[tx.fund_type]

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-white font-semibold">Transaction Detail</h2>
            <button onClick={onClose} className="text-[#64748B] hover:text-white">✕</button>
          </div>
          <div className="px-6 py-5 space-y-4">

            {/* Amount */}
            <div className="bg-[#060E1A] border border-white/5 rounded-2xl p-5 text-center">
              <p className="text-[#64748B] text-xs mb-1">Amount</p>
              <p className="text-white text-3xl font-bold">{formatNaira(tx.amount)}</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border
                                text-xs font-medium mt-2 ${color}`}>
                {FUND_TYPE_LABELS[tx.fund_type]}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {[
                { label: 'Member',         value: tx.member?.name ?? 'Anonymous' },
                { label: 'Phone',          value: tx.member?.phone ?? '—' },
                { label: 'Payment Method', value: PAYMENT_METHOD_LABELS[tx.payment_method] },
                { label: 'Reference',      value: tx.transaction_ref ?? '—' },
                { label: 'Status',         value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) },
                { label: 'Receipt Sent',   value: tx.receipt_sent ? 'Yes' : 'No' },
                { label: 'Recorded By',    value: tx.recorded_by?.name ?? '—' },
                { label: 'Date',           value: new Date(tx.created_at).toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
                  })
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[#64748B] text-sm">{label}</span>
                  <span className="text-white text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GivingPage() {
  const { user }  = useAdminUser()
  const canRecord = ['R01', 'R02', 'R04'].includes(String(user?.role ?? ''))

  // Filters
  const [fundType,       setFundType]       = useState<FundType | 'all'>('all')
  const [paymentMethod,  setPaymentMethod]  = useState<PaymentMethod | 'all'>('all')
  const [from,           setFrom]           = useState('')
  const [to,             setTo]             = useState('')
  const [page,           setPage]           = useState(1)

  // Selected transaction
  const [selected, setSelected] = useState<GivingTransaction | null>(null)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState<CreateGivingPayload>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [memberSearch, setMemberSearch] = useState('')

  const filters: GivingFilters = {
    fund_type:      fundType,
    payment_method: paymentMethod,
    from,
    to,
    page,
    limit: 20,
  }

  const { data, isLoading, isFetching, refetch } = useGivingTransactions(filters)
  const { data: summary }                         = useGivingSummary(from, to)
  const createMutation                            = useCreateGiving()

  const transactions: GivingTransaction[] = data?.transactions ?? []
  const total: number                     = data?.total        ?? 0
  const pages: number                     = data?.pages        ?? 1

  const hasActiveFilters = !!(fundType !== 'all' || paymentMethod !== 'all' || from || to)

  // Chart data from summary
  const chartData = useMemo(() => {
    if (!summary?.by_fund_type) return []
    return summary.by_fund_type
      .filter((f: any) => f.total > 0)
      .map((f: any) => ({
        name:  f.label,
        total: f.total,
      }))
  }, [summary])

  async function handleCreate() {
    setFormError('')
    if (!form.amount || form.amount <= 0) {
      setFormError('Amount must be greater than 0.')
      return
    }
    try {
      await createMutation.mutateAsync({
        ...form,
        member_id: form.member_id || null,
      })
      setShowModal(false)
      setForm(EMPTY_FORM)
      setMemberSearch('')
      refetch()
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to record giving.')
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Giving Records
          </h1>
          <p className="text-[#64748B] text-sm mt-0.5">
            {isLoading ? 'Loading…' : `${total} transaction${total !== 1 ? 's' : ''}`}
            {isFetching && !isLoading && (
              <span className="ml-2 text-[#334155]">· refreshing</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-xl bg-[#0A1628] border border-white/5
                       hover:border-white/15 flex items-center justify-center
                       text-[#64748B] hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => exportGivingToCSV(transactions)}
            disabled={!transactions.length}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                       text-[#64748B] hover:text-white hover:border-white/20 text-sm
                       transition-colors disabled:opacity-40"
          >
            <Download size={15} /> Export CSV
          </button>
          {canRecord && (
            <button
              onClick={() => { setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A8A]
                         hover:bg-[#1e40af] text-white text-sm transition-colors"
            >
              <Plus size={15} /> Record Giving
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="col-span-2 md:col-span-3 xl:col-span-1 bg-[#0A1628] border
                          border-[#B8860B]/20 rounded-2xl p-4">
            <p className="text-[#64748B] text-xs mb-1">Total Giving</p>
            <p className="text-[#F5C518] text-xl font-bold">
              {formatNaira(summary.grand_total)}
            </p>
            <p className="text-[#334155] text-xs mt-1">
              {summary.transaction_count} transactions
            </p>
          </div>
          {summary.by_fund_type?.map((f: any) => (
            <div key={f.fund_type}
                 className="bg-[#0A1628] border border-white/5 rounded-2xl p-4">
              <p className="text-[#64748B] text-xs mb-1">{f.label}</p>
              <p className="text-white text-lg font-bold">{formatNaira(f.total)}</p>
              <p className="text-[#334155] text-xs mt-1">{f.count} records</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
          <p className="text-white text-sm font-medium mb-4">Giving by Fund Type</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0F1E35" />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }}
                     tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: '#0A1628',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12,
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(v: any) => [formatNaira(v), 'Total']}
              />
              <Bar dataKey="total" fill="#B8860B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={fundType}
            onChange={e => { setFundType(e.target.value as FundType | 'all'); setPage(1) }}
            className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl
                       pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none
                       focus:border-white/10 cursor-pointer"
          >
            {FUND_TYPES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <ChevronDown size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2
                       text-[#64748B] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={paymentMethod}
            onChange={e => { setPaymentMethod(e.target.value as PaymentMethod | 'all'); setPage(1) }}
            className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl
                       pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none
                       focus:border-white/10 cursor-pointer"
          >
            {PAYMENT_METHODS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <ChevronDown size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2
                       text-[#64748B] pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 bg-[#0A1628] border border-white/5
                        rounded-xl px-3 py-2">
          <input
            type="date"
            value={from}
            onChange={e => { setFrom(e.target.value); setPage(1) }}
            className="bg-transparent text-white text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0A1628] border border-white/5
                        rounded-xl px-3 py-2">
          <input
            type="date"
            value={to}
            onChange={e => { setTo(e.target.value); setPage(1) }}
            className="bg-transparent text-white text-sm focus:outline-none"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setFundType('all')
              setPaymentMethod('all')
              setFrom('')
              setTo('')
              setPage(1)
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl
                       bg-[#1E3A8A]/15 border border-[#1E3A8A]/20
                       text-[#93C5FD] text-xs font-medium
                       hover:bg-[#1E3A8A]/25 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Date', 'Fund', 'Amount', 'Member', 'Method', 'Status', 'Reference'].map(h => (
                <th key={h}
                    className="text-left text-xs text-[#64748B] uppercase tracking-wider
                               px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#64748B] mx-auto" />
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#0F1E35] border border-white/5
                                    flex items-center justify-center">
                      <DollarSign size={24} className="text-[#334155]" />
                    </div>
                    <p className="text-[#64748B] text-sm">No giving records found</p>
                  </div>
                </td>
              </tr>
            ) : transactions.map(tx => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                onClick={() => setSelected(tx)}
              />
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3
                          border-t border-white/5">
            <p className="text-[#64748B] text-sm">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10
                           text-[#64748B] hover:text-white text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-lg border border-white/10
                           text-[#64748B] hover:text-white text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selected && (
        <TransactionModal tx={selected} onClose={() => setSelected(null)} />
      )}

      {/* Record Giving Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40"
               onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl
                            w-full max-w-md">

              <div className="flex items-center justify-between px-6 py-4
                              border-b border-white/5">
                <h2 className="text-white font-semibold">Record Giving</h2>
                <button onClick={() => setShowModal(false)}
                        className="text-[#64748B] hover:text-white">✕</button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                                  px-4 py-3 text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">
                    Amount (NGN) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.amount || ''}
                    onChange={e => setForm(p => ({
                      ...p, amount: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="0.00"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  />
                </div>

                {/* Fund Type + Payment Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Fund Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.fund_type}
                      onChange={e => setForm(p => ({
                        ...p, fund_type: e.target.value as FundType
                      }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-[#1E3A8A]"
                    >
                      {FUND_TYPES.filter(f => f.value !== 'all').map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Payment Method <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.payment_method}
                      onChange={e => setForm(p => ({
                        ...p, payment_method: e.target.value as PaymentMethod
                      }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-[#1E3A8A]"
                    >
                      {PAYMENT_METHODS.filter(m => m.value !== 'all').map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Member ID (optional) */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">
                    Member ID <span className="text-[#334155]">(optional - leave blank for anonymous)</span>
                  </label>
                  <input
                    type="text"
                    value={form.member_id ?? ''}
                    onChange={e => setForm(p => ({
                      ...p, member_id: e.target.value || null
                    }))}
                    placeholder="Paste member UUID"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A] font-mono"
                  />
                </div>

                {/* Transaction Ref */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">
                    Transaction Reference
                    <span className="text-[#334155] ml-1">(auto-generated if blank)</span>
                  </label>
                  <input
                    type="text"
                    value={form.transaction_ref ?? ''}
                    onChange={e => setForm(p => ({
                      ...p, transaction_ref: e.target.value || null
                    }))}
                    placeholder="e.g. SW-2026-XXXXXX"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A] font-mono"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  >
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10
                             text-[#64748B] hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.status === 'pending'}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af]
                             text-white font-semibold text-sm transition-colors
                             disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.status === 'pending'
                    ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    : 'Save Record'
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}