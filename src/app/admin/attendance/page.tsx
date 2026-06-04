'use client'
// src/app/admin/attendance/page.tsx
// Attendance Dashboard — full analytics for R01-R04, limited for R05-R09

import { useState, useMemo, useCallback } from 'react'
import { Plus, Download, RefreshCw } from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useServiceRecords, exportServiceRecordsToCSV,
  type ServiceType, type CreateServiceRecordPayload
} from '@/hooks/admin/useAttendance'
import { useCreateServiceRecord } from '@/hooks/admin/useAttendance'

import AttendanceFilters, { type FilterState } from './components/AttendanceFilters'
import AttendanceMetrics from './components/AttendanceMetrics'
import AttendanceTrendChart from './components/AttendanceTrendChart'
import {
  ServiceComparisonChart,
  AttendanceBreakdownPie,
  GrowthTrendChart,
} from './components/AttendanceCharts'
import { TopServicesTable, RecentServicesTable } from './components/AttendanceTables'
import LimitedAccessView from './components/LimitedAccessView'
import ServiceRecordDrawer from '@/components/admin/attendance/ServiceRecordDrawer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDefaultFilters(): FilterState {
  const now  = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 30)
  return {
    from:   from.toISOString().split('T')[0],
    to:     now.toISOString().split('T')[0],
    type:   'all',
    preset: '30d',
  }
}

const EMPTY_FORM: CreateServiceRecordPayload = {
  service_date:   new Date().toISOString().split('T')[0],
  service_type:   'sunday_service',
  total_count:    0,
  men_count:      null,
  women_count:    null,
  children_count: null,
  first_timers:   0,
  notes:          null,
}

const CAN_RECORD = ['R01', 'R02', 'R03', 'R04']
const FULL_ACCESS = ['R01', 'R02', 'R03', 'R04']

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 bg-[#0A1628] border border-white/5 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-[#0A1628] border border-white/5 rounded-2xl" />
        <div className="h-64 bg-[#0A1628] border border-white/5 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-56 bg-[#0A1628] border border-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { user } = useAdminUser()
  const role      = user?.role ?? ''
  const userName  = user?.name ?? 'Unknown'

  const [filters,    setFilters]    = useState<FilterState>(getDefaultFilters)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [form,       setForm]       = useState<CreateServiceRecordPayload>(EMPTY_FORM)
  const [formError,  setFormError]  = useState('')
  const [page,       setPage]       = useState(1)

  const createMutation = useCreateServiceRecord()

  // Check analytics access — R05-R09 need ANALYTICS_ACCESS permission
  const hasFullAccess = FULL_ACCESS.includes(role) ||
    (user?.permissions ?? []).includes('ANALYTICS_ACCESS')

  const canRecord = CAN_RECORD.includes(role)

  // Fetch filtered records
  const { data, isLoading, refetch } = useServiceRecords({
    from:  filters.from  || undefined,
    to:    filters.to    || undefined,
    type:  filters.type  !== 'all' ? filters.type as ServiceType : undefined,
    page,
    limit: 100, // fetch more for analytics
  })

  // Fetch all records for growth comparison (no date filter)
  const { data: allData } = useServiceRecords({ limit: 200 })

  const records    = useMemo(() => data?.records    ?? [], [data])
  const allRecords = useMemo(() => allData?.records ?? [], [allData])

  const handleFiltersChange = useCallback((f: FilterState) => {
    setFilters(f)
    setPage(1)
  }, [])

  async function handleSubmit() {
    if (!form.service_date) { setFormError('Service date is required.'); return }
    if (!form.total_count)  { setFormError('Total count is required.'); return }
    setFormError('')
    try {
      await createMutation.mutateAsync(form)
      setModalOpen(false)
      setForm(EMPTY_FORM)
      refetch()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  return (
    <div className="space-y-6 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-playfair">Attendance</h1>
          <p className="text-sm text-gray-400 mt-1">
            {hasFullAccess
              ? 'Full analytics dashboard for Sure Word Glorious Gospel Assembly'
              : 'Attendance overview for your unit'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasFullAccess && (
            <button
              onClick={() => exportServiceRecordsToCSV(records)}
              disabled={!records.length}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold
                         border border-white/10 text-gray-300 hover:bg-white/5 transition-colors
                         disabled:opacity-40">
              <Download size={14} /> Export CSV
            </button>
          )}
          <button onClick={() => refetch()}
            className="p-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filters — sticky */}
      <div className="sticky top-0 z-20 bg-[#060E1A]/95 backdrop-blur-sm border-b border-white/5 -mx-6 px-6 mb-2">
        <AttendanceFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {/* Content */}
      {isLoading ? <Skeleton /> : hasFullAccess ? (
        <div className="space-y-6">

          {/* Metrics */}
          <AttendanceMetrics records={records} allRecords={allRecords} fromDate={filters.from} toDate={filters.to} />

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AttendanceTrendChart records={records} />
            </div>
            <AttendanceBreakdownPie records={records} />
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ServiceComparisonChart records={records} />
            <GrowthTrendChart records={records} />
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopServicesTable records={records} />
            <div />
          </div>
          <RecentServicesTable records={records} />

        </div>
      ) : (
        <LimitedAccessView records={records} userName={userName} />
      )}

      {/* Floating Action Button — Record Attendance */}
      {canRecord && (
        <button
          onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}
          className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 rounded-2xl
                     bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A]/80
                     hover:from-[#1E3A8A]/90 hover:to-[#1E3A8A]/70
                     text-white font-semibold text-sm shadow-2xl
                     border border-[#1E3A8A]/50 transition-all
                     hover:shadow-[0_0_30px_rgba(30,58,138,0.4)]">
          <Plus size={16} /> Record Attendance
        </button>
      )}

      {/* Record Attendance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#0A1628] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-base font-bold text-white mb-5">Record Service Attendance</h2>

            {formError && (
              <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Service Date *</label>
                  <input type="date" value={form.service_date}
                    onChange={e => setForm(p => ({ ...p, service_date: e.target.value }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-[#1E3A8A] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Service Type *</label>
                  <select value={form.service_type}
                    onChange={e => setForm(p => ({ ...p, service_type: e.target.value as ServiceType }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-[#1E3A8A] transition-colors">
                    <option value="sunday_service">Sunday Service</option>
                    <option value="word_feast">Word Feast</option>
                    <option value="moment_of_encounter">Moment of Encounter</option>
                    <option value="healing_streams">Healing Streams</option>
                    <option value="special">Special Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Total Present *</label>
                  <input type="number" min="0" value={form.total_count || ''}
                    onChange={e => setForm(p => ({ ...p, total_count: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-[#1E3A8A] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">First Timers</label>
                  <input type="number" min="0" value={form.first_timers || ''}
                    onChange={e => setForm(p => ({ ...p, first_timers: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5
                               text-sm text-white focus:outline-none focus:border-[#1E3A8A] transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['men_count', 'women_count', 'children_count'] as const).map((field, i) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs text-gray-400">{['Men', 'Women', 'Children'][i]}</label>
                    <input type="number" min="0"
                      value={form[field] ?? ''}
                      onChange={e => setForm(p => ({
                        ...p, [field]: e.target.value ? parseInt(e.target.value) : null
                      }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5
                                 text-sm text-white focus:outline-none focus:border-[#1E3A8A] transition-colors" />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Notes</label>
                <textarea value={form.notes ?? ''}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value || null }))}
                  rows={2} placeholder="Optional notes about the service..."
                  className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5
                             text-sm text-white placeholder:text-gray-600 resize-none
                             focus:outline-none focus:border-[#1E3A8A] transition-colors" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10
                           text-gray-400 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={createMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                           bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white transition-colors
                           disabled:opacity-50">
                {createMutation.isPending ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
