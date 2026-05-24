// src/app/admin/attendance/page.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Calendar, Download, Plus, Loader2,
  Users, TrendingUp, Star, ChevronDown,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useServiceRecords,
  useCreateServiceRecord,
  exportServiceRecordsToCSV,
  type ServiceType,
  type CreateServiceRecordPayload,
} from '@/hooks/admin/useAttendance'
import ServiceRecordDrawer from '@/components/admin/attendance/ServiceRecordDrawer'
import type { ServiceRecord } from '@/hooks/admin/useAttendance'

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_TYPES: { value: ServiceType | 'all'; label: string }[] = [
  { value: 'all',           label: 'All Services'        },
  { value: 'sunday_first',  label: 'Sunday 1st Service'  },
  { value: 'sunday_second', label: 'Sunday 2nd Service'  },
  { value: 'wednesday',     label: 'Wednesday Service'   },
  { value: 'special',       label: 'Special Service'     },
]

const SERVICE_LABEL: Record<ServiceType, string> = {
  sunday_first:  'Sunday 1st',
  sunday_second: 'Sunday 2nd',
  wednesday:     'Wednesday',
  special:       'Special',
}

const EMPTY_FORM: CreateServiceRecordPayload = {
  service_date:   new Date().toISOString().split('T')[0],
  service_type:   'sunday_first',
  total_count:    0,
  men_count:      null,
  women_count:    null,
  children_count: null,
  first_timers:   0,
  notes:          null,
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label, value, icon: Icon, gold,
}: {
  label: string; value: string | number; icon: any; gold?: boolean
}) {
  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${gold ? 'bg-[#B8860B]/10' : 'bg-[#1E3A8A]/20'}`}>
        <Icon size={20} className={gold ? 'text-[#F5C518]' : 'text-[#1E3A8A]'} />
      </div>
      <div>
        <p className="text-[#64748B] text-xs mb-0.5">{label}</p>
        <p className="text-white text-xl font-semibold">{value}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { user } = useAdminUser()
  const canRecord = ['R01', 'R03', 'R09'].includes(String(user?.role ?? ''))

  // Filters
  const [from,  setFrom]  = useState('')
  const [to,    setTo]    = useState('')
  const [type,  setType]  = useState<ServiceType | 'all'>('all')
  const [page,  setPage]  = useState(1)

  // Drawer
  const [selected, setSelected] = useState<ServiceRecord | null>(null)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState<CreateServiceRecordPayload>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useServiceRecords({ from, to, type, page, limit: 20 })
  const createMutation = useCreateServiceRecord()

  const records: ServiceRecord[] = data?.records ?? []
  const total: number            = data?.total   ?? 0
  const pages: number            = data?.pages   ?? 1

  // ── Metrics ────────────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    if (!records.length) return { highest: 0, average: 0, firstTimers: 0 }
    const counts = records.map(r => r.total_count)
    return {
      highest:     Math.max(...counts),
      average:     Math.round(counts.reduce((a, b) => a + b, 0) / counts.length),
      firstTimers: records.reduce((a, r) => a + (r.first_timers ?? 0), 0),
    }
  }, [records])

  // ── Chart data ─────────────────────────────────────────────────────────────

  const chartData = useMemo(() =>
    [...records]
      .sort((a, b) => a.service_date.localeCompare(b.service_date))
      .slice(-12)
      .map(r => ({
        date:  r.service_date.slice(5),   // MM-DD
        count: r.total_count,
        label: SERVICE_LABEL[r.service_type],
      })),
  [records])

  // ── Modal handlers ─────────────────────────────────────────────────────────

  function openModal() {
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  async function handleCreate() {
    setFormError('')
    if (!form.service_date) { setFormError('Service date is required.'); return }
    if (!form.total_count || form.total_count < 0) {
      setFormError('Total count is required and must be 0 or more.'); return
    }
    try {
      await createMutation.mutateAsync(form)
      setShowModal(false)
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to save record.')
    }
  }

  function formField(
    label: string,
    key: keyof CreateServiceRecordPayload,
    required?: boolean,
  ) {
    return (
      <div>
        <label className="block text-xs text-[#64748B] mb-1">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <input
          type="number"
          min={0}
          value={form[key] ?? ''}
          onChange={e => setForm(prev => ({
            ...prev,
            [key]: e.target.value === '' ? null : Number(e.target.value),
          }))}
          className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
        />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Attendance
          </h1>
          <p className="text-[#64748B] text-sm mt-0.5">{total} records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportServiceRecordsToCSV(records)}
            disabled={!records.length}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-[#64748B] hover:text-white hover:border-white/20 text-sm transition-colors disabled:opacity-40"
          >
            <Download size={15} /> Export CSV
          </button>
          {canRecord && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-sm transition-colors"
            >
              <Plus size={15} /> Record Service
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Highest Attendance" value={metrics.highest} icon={TrendingUp} />
        <MetricCard label="Average Attendance" value={metrics.average} icon={Users} />
        <MetricCard label="Total First Timers"  value={metrics.firstTimers} icon={Star} gold />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
          <p className="text-white text-sm font-medium mb-4">Attendance Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0F1E35" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#F5C518' }}
              />
              <Line type="monotone" dataKey="count" stroke="#F5C518" strokeWidth={2} dot={{ fill: '#F5C518', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0A1628] border border-white/5 rounded-xl px-3 py-2">
          <Calendar size={14} className="text-[#64748B]" />
          <input
            type="date"
            value={from}
            onChange={e => { setFrom(e.target.value); setPage(1) }}
            className="bg-transparent text-white text-sm focus:outline-none"
            placeholder="From"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#0A1628] border border-white/5 rounded-xl px-3 py-2">
          <Calendar size={14} className="text-[#64748B]" />
          <input
            type="date"
            value={to}
            onChange={e => { setTo(e.target.value); setPage(1) }}
            className="bg-transparent text-white text-sm focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={type}
            onChange={e => { setType(e.target.value as ServiceType | 'all'); setPage(1) }}
            className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl pl-3 pr-8 py-2 text-white text-sm focus:outline-none focus:border-white/10 cursor-pointer"
          >
            {SERVICE_TYPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Date', 'Service', 'Total', 'Men', 'Women', 'Children', 'First Timers', 'Recorded By'].map(h => (
                <th key={h} className="text-left text-xs text-[#64748B] uppercase tracking-wider px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#64748B] mx-auto" />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <Users size={32} className="text-[#334155] mx-auto mb-2" />
                  <p className="text-[#64748B] text-sm">No attendance records found</p>
                </td>
              </tr>
            ) : records.map(r => (
              <tr
                key={r.id}
                onClick={() => setSelected(r)}
                className="border-b border-white/5 hover:bg-[#0F1E35] cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-white text-sm">{r.service_date}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#1E3A8A]/20 text-[#60a5fa] text-xs">
                    {SERVICE_LABEL[r.service_type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-white font-semibold text-sm">{r.total_count}</td>
                <td className="px-4 py-3 text-[#64748B] text-sm">{r.men_count      ?? '—'}</td>
                <td className="px-4 py-3 text-[#64748B] text-sm">{r.women_count    ?? '—'}</td>
                <td className="px-4 py-3 text-[#64748B] text-sm">{r.children_count ?? '—'}</td>
                <td className="px-4 py-3 text-sm">
                  {r.first_timers > 0
                    ? <span className="text-[#F5C518] font-medium">{r.first_timers}</span>
                    : <span className="text-[#334155]">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-[#64748B] text-sm">{r.recorded_by.name}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-[#64748B] text-sm">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-[#64748B] hover:text-white text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-[#64748B] hover:text-white text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <ServiceRecordDrawer
        record={selected}
        onClose={() => setSelected(null)}
      />

      {/* Record Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl w-full max-w-lg">

              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-semibold">Record Service Attendance</h2>
                <button onClick={() => setShowModal(false)} className="text-[#64748B] hover:text-white">✕</button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Service Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.service_date}
                      onChange={e => setForm(prev => ({ ...prev, service_date: e.target.value }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Service Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.service_type}
                      onChange={e => setForm(prev => ({ ...prev, service_type: e.target.value as ServiceType }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    >
                      {SERVICE_TYPES.filter(s => s.value !== 'all').map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formField('Total Present', 'total_count', true)}
                  {formField('First Timers',  'first_timers')}
                  {formField('Men',            'men_count')}
                  {formField('Women',          'women_count')}
                  {formField('Children',       'children_count')}
                </div>

                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value || null }))}
                    placeholder="Optional notes..."
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1E3A8A] resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#64748B] hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.status === 'pending'}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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