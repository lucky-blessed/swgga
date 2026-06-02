// src/app/admin/reports/views/DeptHeadView.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, FileText, Layers, CheckSquare, Square, ChevronRight } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import ReportForm from '../components/ReportForm'
import ReportDetail from '../components/ReportDetail'
import { ListSkeleton } from '../components/LoadingSkeleton'

interface Report {
  id: string; title: string; week_of: string; status: string
  report_type: string; attendance_count: number | null
  activities_summary: string | null; successes: string | null
  challenges: string | null; prayer_items: string | null
  upcoming_plans: string | null; remarks: string | null
  attachment_url: string | null; attachment_name: string | null
  submitted_at: string | null; submitter_name: string
  submitter_unit: string | null; submitted_by: string
}

interface Props { userId: string; role: string }

type ActivePanel = 'list' | 'new' | 'collate'

export default function DeptHeadView({ userId, role }: Props) {
  const [unitReports,   setUnitReports]   = useState<Report[]>([])
  const [myReports,     setMyReports]     = useState<Report[]>([])
  const [loading,       setLoading]       = useState(true)
  const [activePanel,   setActivePanel]   = useState<ActivePanel>('list')
  const [selectedId,    setSelectedId]    = useState<string | null>(null)
  const [detail,        setDetail]        = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  // Collation state
  const [selectedForCollation, setSelectedForCollation] = useState<Set<string>>(new Set())
  const [collationNotes,       setCollationNotes]       = useState('')
  const [activeTab,            setActiveTab]            = useState<'units' | 'mine'>('units')

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/v1/admin/reports', { credentials: 'include' })
    const data = await res.json()
    const all: Report[] = data.reports ?? []
    setUnitReports(all.filter(r => r.report_type === 'unit'))
    setMyReports(all.filter(r => r.report_type === 'department' && r.submitted_by === userId))
    setLoading(false)
  }, [userId])

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    setSelectedId(id)
    const res  = await fetch(`/api/v1/admin/reports/${id}`, { credentials: 'include' })
    const data = await res.json()
    setDetail(data)
    setDetailLoading(false)
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  async function handleSave(action: 'draft' | 'submit' | 'resubmit', data: any) {
    setSaving(true)
    try {
      if (action === 'resubmit' && selectedId) {
        const res = await fetch(`/api/v1/admin/reports/${selectedId}`, {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'resubmit', ...data }),
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error ?? 'Failed')
        showToast('Report resubmitted.')
        await fetchReports()
        await fetchDetail(selectedId)
      } else {
        const res = await fetch('/api/v1/admin/reports', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, report_type: 'department', ...data }),
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error ?? 'Failed')
        if (action === 'submit') {
          showToast('Departmental report submitted to Senior Pastor.')
          setActivePanel('list')
        } else {
          showToast('Draft saved.')
        }
        await fetchReports()
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Something went wrong', false)
    } finally { setSaving(false) }
  }

  async function handleFeedback(message: string, allowResubmit: boolean) {
    if (!selectedId) return
    await fetch(`/api/v1/admin/reports/${selectedId}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'feedback', message, allow_resubmit: allowResubmit }),
    })
    await fetchReports()
    await fetchDetail(selectedId)
  }

  function toggleCollation(id: string) {
    setSelectedForCollation(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function buildCollationSummary(): string {
    const selected = unitReports.filter(r => selectedForCollation.has(r.id))
    const totalAttendance = selected.reduce((sum, r) => sum + (r.attendance_count ?? 0), 0)

    let summary = `DEPARTMENTAL WEEKLY REPORT SUMMARY\n`
    summary += `Week of ${selected[0]?.week_of ?? ''}\n`
    summary += `Units Included: ${selected.length}\n`
    summary += `Total Attendance: ${totalAttendance}\n\n`

    selected.forEach(r => {
      summary += `--- ${r.submitter_name} (${r.submitter_unit ?? 'Unit'}) ---\n`
      if (r.activities_summary) summary += `Activities: ${r.activities_summary}\n`
      if (r.successes)          summary += `Wins: ${r.successes}\n`
      if (r.challenges)         summary += `Challenges: ${r.challenges}\n`
      summary += '\n'
    })

    if (collationNotes) summary += `Department Head Notes:\n${collationNotes}`
    return summary.trim()
  }

  const pendingUnits = unitReports.filter(r => ['submitted', 'resubmitted'].includes(r.status))
  const reviewedUnits = unitReports.filter(r => ['under_review', 'approved'].includes(r.status))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-playfair">Department Reports</h1>
          <p className="text-sm text-gray-400 mt-1">
            Review unit reports, collate them, and submit your departmental summary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActivePanel(p => p === 'collate' ? 'list' : 'collate')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       transition-colors
                       ${activePanel === 'collate'
                         ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                         : 'bg-[#0A1628] border border-white/10 text-gray-300 hover:bg-white/5'
                       }`}>
            <Layers size={15} /> Collate Reports
            {pendingUnits.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingUnits.length}
              </span>
            )}
          </button>
          <button onClick={() => setActivePanel(p => p === 'new' ? 'list' : 'new')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       transition-colors
                       ${activePanel === 'new'
                         ? 'bg-[#1E3A8A]/20 border border-[#1E3A8A]/30 text-blue-400'
                         : 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white'
                       }`}>
            <Plus size={15} /> New Dept Report
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

      {/* Collation Panel */}
      {activePanel === 'collate' && (
        <div className="bg-[#0A1628] border border-cyan-500/20 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Collate Unit Reports</h2>
              <span className="text-xs text-gray-500">
                Select reports to include in your departmental summary
              </span>
            </div>
            <button onClick={() => setActivePanel('list')} className="text-gray-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {unitReports.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No unit reports available to collate.</p>
            ) : (
              <>
                <div className="space-y-2">
                  {unitReports.map(r => {
                    const checked = selectedForCollation.has(r.id)
                    return (
                      <button key={r.id} onClick={() => toggleCollation(r.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                          ${checked
                            ? 'bg-cyan-500/5 border-cyan-500/30'
                            : 'bg-[#060E1A] border-white/5 hover:border-white/10'
                          }`}>
                        {checked
                          ? <CheckSquare size={16} className="text-cyan-400 flex-shrink-0" />
                          : <Square size={16} className="text-gray-600 flex-shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{r.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {r.submitter_name}
                            {r.submitter_unit && ` · ${r.submitter_unit}`}
                            {r.attendance_count != null && ` · ${r.attendance_count} attendance`}
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </button>
                    )
                  })}
                </div>

                {selectedForCollation.size > 0 && (
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <p className="text-sm font-semibold text-white">
                      {selectedForCollation.size} report{selectedForCollation.size > 1 ? 's' : ''} selected
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        Additional Notes (optional)
                      </label>
                      <textarea
                        value={collationNotes}
                        onChange={e => setCollationNotes(e.target.value)}
                        rows={3}
                        placeholder="Add any departmental summary notes..."
                        className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 text-sm
                                   text-white placeholder:text-gray-600 focus:outline-none focus:border-[#1E3A8A]/60
                                   transition-all resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const summary = buildCollationSummary()
                          setActivePanel('new')
                          // Store in sessionStorage for the form to pick up
                          sessionStorage.setItem('collation_summary', summary)
                          sessionStorage.setItem('collation_ids', JSON.stringify([...selectedForCollation]))
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                   bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
                        <ChevronRight size={14} />
                        Use as Dept Report Draft
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* New Dept Report Form */}
      {activePanel === 'new' && (
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white">Departmental Report</h2>
              <span className="text-xs text-gray-500">This will be submitted to the Senior Pastor</span>
            </div>
            <button onClick={() => setActivePanel('list')} className="text-gray-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="p-6">
            <ReportForm
              mode="create"
              saving={saving}
              onSave={handleSave}
              onCancel={() => setActivePanel('list')}
            />
          </div>
        </div>
      )}

      {/* Tabs: Unit Reports / My Dept Reports */}
      <div className="flex border-b border-white/5">
        {[
          { key: 'units' as const, label: `Unit Reports`, count: unitReports.length },
          { key: 'mine'  as const, label: `My Dept Reports`, count: myReports.length },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2
              ${activeTab === t.key
                ? 'text-white border-[#B8860B]'
                : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full
              ${activeTab === t.key ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-600'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? <ListSkeleton /> : (
            (activeTab === 'units' ? unitReports : myReports).length === 0 ? (
              <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-10
                              flex flex-col items-center justify-center space-y-3">
                <FileText size={20} className="text-gray-600" />
                <p className="text-sm text-gray-500">
                  {activeTab === 'units' ? 'No unit reports submitted yet' : 'No departmental reports yet'}
                </p>
              </div>
            ) : (
              (activeTab === 'units' ? unitReports : myReports).map(r => (
                <button key={r.id} onClick={() => fetchDetail(r.id)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all
                    ${selectedId === r.id
                      ? 'bg-[#1E3A8A]/10 border-[#1E3A8A]/40'
                      : 'bg-[#0A1628] border-white/5 hover:border-white/10'
                    }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.submitter_name}
                        {r.submitter_unit && ` · ${r.submitter_unit}`}
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
              ))
            )
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
            onResubmit={data => handleSave('resubmit', data)}
          />
        </div>
      </div>
    </div>
  )
}
