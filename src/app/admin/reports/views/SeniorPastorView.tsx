// src/app/admin/reports/views/SeniorPastorView.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart2, Clock, CheckCircle, AlertCircle,
  FileText, ChevronRight, Filter, Search
} from 'lucide-react'
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge'
import ReportDetail from '../components/ReportDetail'
import { DashboardSkeleton, ListSkeleton } from '../components/LoadingSkeleton'

interface Report {
  id: string; title: string; week_of: string; status: string
  report_type: string; attendance_count: number | null
  activities_summary: string | null; successes: string | null
  challenges: string | null; prayer_items: string | null
  upcoming_plans: string | null; remarks: string | null
  attachment_url: string | null; attachment_name: string | null
  submitted_at: string | null; submitter_name: string
  submitter_unit: string | null; submitted_by: string
  ministry_name: string | null
}

interface DeptGroup {
  name:     string
  reports:  Report[]
  total:    number
  pending:  number
  approved: number
}

interface Props { userId: string; role: string }

type ViewMode = 'dashboard' | 'list'

export default function SeniorPastorView({ userId, role }: Props) {
  const [reports,       setReports]       = useState<Report[]>([])
  const [loading,       setLoading]       = useState(true)
  const [viewMode,      setViewMode]      = useState<ViewMode>('dashboard')
  const [selectedId,    setSelectedId]    = useState<string | null>(null)
  const [detail,        setDetail]        = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [filterType,    setFilterType]    = useState('all')
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/v1/admin/reports?limit=50', { credentials: 'include' })
    const data = await res.json()
    setReports(data.reports ?? [])
    setLoading(false)
  }, [])

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    setSelectedId(id)
    const res  = await fetch(`/api/v1/admin/reports/${id}`, { credentials: 'include' })
    const data = await res.json()
    setDetail(data)
    setDetailLoading(false)
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  async function handleFeedback(message: string, allowResubmit: boolean) {
    if (!selectedId) return
    await fetch(`/api/v1/admin/reports/${selectedId}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'feedback', message, allow_resubmit: allowResubmit }),
    })
    showToast('Feedback sent.')
    await fetchReports()
    await fetchDetail(selectedId)
  }

  // Group by department
  const deptGroups: DeptGroup[] = []
  const deptMap: Record<string, DeptGroup> = {}
  for (const r of reports) {
    const key = r.ministry_name ?? 'Unassigned'
    if (!deptMap[key]) {
      deptMap[key] = { name: key, reports: [], total: 0, pending: 0, approved: 0 }
      deptGroups.push(deptMap[key])
    }
    deptMap[key].reports.push(r)
    deptMap[key].total++
    if (['submitted', 'resubmitted', 'under_review'].includes(r.status)) deptMap[key].pending++
    if (r.status === 'approved') deptMap[key].approved++
  }

  // Stats
  const totalReports  = reports.length
  const pendingReview = reports.filter(r => ['submitted', 'resubmitted'].includes(r.status)).length
  const approved      = reports.filter(r => r.status === 'approved').length
  const deptReports   = reports.filter(r => r.report_type === 'department').length
  const completionPct = totalReports > 0 ? Math.round((approved / totalReports) * 100) : 0

  // Filtered list view
  const filtered = reports.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (filterType   !== 'all' && r.report_type !== filterType) return false
    const q = search.toLowerCase()
    if (q && !r.title.toLowerCase().includes(q) &&
             !r.submitter_name.toLowerCase().includes(q) &&
             !(r.ministry_name ?? '').toLowerCase().includes(q)) return false
    return true
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-playfair">Reports Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            All department and unit reports across Sure Word Glorious Gospel Assembly
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
              ${viewMode === 'dashboard'
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-[#0A1628] border border-white/10 text-gray-400 hover:bg-white/5'
              }`}>
            Dashboard
          </button>
          <button onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
              ${viewMode === 'list'
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-[#0A1628] border border-white/10 text-gray-400 hover:bg-white/5'
              }`}>
            All Reports
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
          ${toast.ok
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          {toast.msg}
        </div>
      )}

      {/* Dashboard Mode */}
      {viewMode === 'dashboard' && (
        <>
          {loading ? <DashboardSkeleton /> : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Reports', value: totalReports, icon: FileText,    color: 'text-blue-400',  bg: 'bg-blue-500/10' },
                  { label: 'Pending Review',value: pendingReview,icon: Clock,       color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Dept Reports',  value: deptReports,  icon: BarChart2,   color: 'text-cyan-400',  bg: 'bg-cyan-500/10' },
                  { label: 'Approved',      value: approved,     icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
                ].map(s => (
                  <div key={s.label} className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 space-y-3">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                      <s.icon size={16} className={s.color} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completion bar */}
              <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Overall Completion Rate</p>
                  <span className="text-sm font-bold text-white">{completionPct}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#B8860B] rounded-full transition-all duration-700"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{approved} of {totalReports} reports approved</p>
              </div>

              {/* Pending review section */}
              {pendingReview > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-amber-400" />
                    <p className="text-sm font-semibold text-amber-400">
                      {pendingReview} report{pendingReview > 1 ? 's' : ''} awaiting your review
                    </p>
                  </div>
                  <div className="space-y-2">
                    {reports
                      .filter(r => ['submitted', 'resubmitted'].includes(r.status))
                      .slice(0, 5)
                      .map(r => (
                        <button key={r.id} onClick={() => { fetchDetail(r.id); setViewMode('list') }}
                          className="w-full flex items-center justify-between gap-3 bg-[#0A1628]
                                     border border-white/5 rounded-xl px-4 py-3 hover:border-amber-500/20
                                     transition-colors text-left">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{r.title}</p>
                            <p className="text-xs text-gray-500">
                              {r.submitter_name}
                              {r.ministry_name && ` · ${r.ministry_name}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge status={r.status} />
                            <ChevronRight size={14} className="text-gray-600" />
                          </div>
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Department cards */}
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  By Department
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deptGroups.map(dept => {
                    const pct = dept.total > 0 ? Math.round((dept.approved / dept.total) * 100) : 0
                    return (
                      <button key={dept.name}
                        onClick={() => { setViewMode('list'); setSearch(''); setFilterStatus('all') }}
                        className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 text-left
                                   hover:border-white/10 transition-all group space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-white">{dept.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {dept.total} report{dept.total > 1 ? 's' : ''}
                            </p>
                          </div>
                          {dept.pending > 0 && (
                            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/20">
                              {dept.pending} pending
                            </span>
                          )}
                        </div>

                        {/* Status breakdown */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Completion</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#B8860B] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Status pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(
                            dept.reports.reduce((acc, r) => {
                              acc[r.status] = (acc[r.status] ?? 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                          ).map(([status, count]) => (
                            <span key={status}
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium
                                ${STATUS_CONFIG[status]?.color ?? 'text-gray-400'}
                                ${STATUS_CONFIG[status]?.bg ?? 'bg-white/5 border-white/10'}`}>
                              {count} {STATUS_CONFIG[status]?.label ?? status}
                            </span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* List Mode */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full bg-[#0A1628] border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                             text-sm text-white placeholder:text-gray-600 focus:outline-none
                             focus:border-[#1E3A8A]/60 transition-all" />
              </div>
              <div className="flex gap-2">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="flex-1 bg-[#0A1628] border border-white/10 rounded-xl px-3 py-2 text-xs
                             text-gray-300 focus:outline-none focus:border-[#1E3A8A]/60 transition-all">
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="flex-1 bg-[#0A1628] border border-white/10 rounded-xl px-3 py-2 text-xs
                             text-gray-300 focus:outline-none focus:border-[#1E3A8A]/60 transition-all">
                  <option value="all">All Types</option>
                  <option value="unit">Unit Reports</option>
                  <option value="department">Dept Reports</option>
                </select>
              </div>
            </div>

            {/* Report list */}
            {loading ? <ListSkeleton /> : filtered.length === 0 ? (
              <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-10
                              flex flex-col items-center justify-center space-y-3">
                <Filter size={20} className="text-gray-600" />
                <p className="text-sm text-gray-500">No reports match your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(r => (
                  <button key={r.id} onClick={() => fetchDetail(r.id)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all
                      ${selectedId === r.id
                        ? 'bg-[#1E3A8A]/10 border-[#1E3A8A]/40'
                        : 'bg-[#0A1628] border-white/5 hover:border-white/10'
                      }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                            ${r.report_type === 'department'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'bg-white/5 text-gray-500'
                            }`}>
                            {r.report_type === 'department' ? 'Dept' : 'Unit'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate mt-1">{r.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.submitter_name}
                          {r.ministry_name && ` · ${r.ministry_name}`}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Week of {new Date(r.week_of).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <ReportDetail
              loading={detailLoading}
              report={detail?.report ?? null}
              comments={detail?.feedback ?? []}
              versions={detail?.versions ?? []}
              currentUserId={userId}
              currentRole={role}
              saving={saving}
              onClose={() => setSelectedId(null)}
              onFeedback={handleFeedback}
              onResubmit={async () => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}
