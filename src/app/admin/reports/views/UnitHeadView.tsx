// src/app/admin/reports/views/UnitHeadView.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, FileText } from 'lucide-react'
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

export default function UnitHeadView({ userId, role }: Props) {
  const [reports,       setReports]       = useState<Report[]>([])
  const [loading,       setLoading]       = useState(true)
  const [showForm,      setShowForm]      = useState(false)
  const [selectedId,    setSelectedId]    = useState<string | null>(null)
  const [detail,        setDetail]        = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/v1/admin/reports', { credentials: 'include' })
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
        showToast('Report resubmitted successfully.')
        await fetchReports()
        await fetchDetail(selectedId)
      } else {
        const res = await fetch('/api/v1/admin/reports', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...data }),
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error ?? 'Failed')
        if (action === 'submit') {
          showToast('Report submitted successfully.')
          setShowForm(false)
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

  const statusOrder = ['resubmission_requested', 'draft', 'submitted', 'resubmitted', 'under_review', 'reviewed', 'approved']
  const sorted = [...reports].sort((a, b) =>
    statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-playfair">My Reports</h1>
          <p className="text-sm text-gray-400 mt-1">Submit your weekly unit report to your department head</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white transition-colors">
            <Plus size={15} /> New Report
          </button>
        )}
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

      {/* New report form */}
      {showForm && (
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white">New Weekly Report</h2>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-6">
            <ReportForm
              mode="create" saving={saving}
              onSave={handleSave} onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Reports grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? <ListSkeleton /> : sorted.length === 0 ? (
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-10
                            flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <FileText size={20} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">No reports yet</p>
              <p className="text-xs text-gray-600">Create your first weekly report above</p>
            </div>
          ) : sorted.map(r => (
            <button key={r.id} onClick={() => fetchDetail(r.id)}
              className={`w-full text-left rounded-2xl p-4 border transition-all
                ${selectedId === r.id
                  ? 'bg-[#1E3A8A]/10 border-[#1E3A8A]/40'
                  : 'bg-[#0A1628] border-white/5 hover:border-white/10 hover:bg-white/2'
                }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
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

        {/* Detail */}
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