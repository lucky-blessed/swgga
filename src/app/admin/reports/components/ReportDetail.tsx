// src/app/admin/reports/components/ReportDetail.tsx
'use client'

import { useState } from 'react'
import { FileText, MessageSquare, History, Paperclip, Edit2, X } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ThreadPanel from './ThreadPanel'
import HistoryPanel from './HistoryPanel'
import ReportForm from './ReportForm'
import { DetailSkeleton } from './LoadingSkeleton'

interface Report {
  id:                 string
  title:              string
  week_of:            string
  status:             string
  report_type:        string
  attendance_count:   number | null
  activities_summary: string | null
  successes:          string | null
  challenges:         string | null
  prayer_items:       string | null
  upcoming_plans:     string | null
  remarks:            string | null
  attachment_url:     string | null
  attachment_name:    string | null
  submitted_at:       string | null
  submitter_name:     string
  submitter_unit:     string | null
  submitted_by:       string
}

interface Comment {
  id: string; message: string; allow_resubmit: boolean
  created_at: string; reviewer_name: string; feedback_by: string
}

interface Version {
  id: string; version_number: number; title: string
  saved_at: string; saved_by_name: string
  attendance_count: number | null; activities_summary: string | null
  successes: string | null; attachment_name: string | null; attachment_url: string | null
}

interface Props {
  loading:       boolean
  report:        Report | null
  comments:      Comment[]
  versions:      Version[]
  currentUserId: string
  currentRole:   string
  saving:        boolean
  onClose:       () => void
  onFeedback:    (message: string, allowResubmit: boolean) => Promise<void>
  onResubmit:    (data: any) => Promise<void>
}

type Tab = 'content' | 'thread' | 'history'

export default function ReportDetail({
  loading, report, comments, versions,
  currentUserId, currentRole, saving,
  onClose, onFeedback, onResubmit,
}: Props) {

  const [tab,         setTab]         = useState<Tab>('content')
  const [showResubmit,setShowResubmit]= useState(false)

  const isReviewer  = ['R01', 'R02', 'R03', 'R04'].includes(currentRole)
  const canResubmit = report?.status === 'resubmission_requested' && report?.submitted_by === currentUserId

  if (loading) return <DetailSkeleton />

  if (!report) return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl flex flex-col items-center
                    justify-center py-20 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
        <FileText size={28} className="text-gray-600" />
      </div>
      <p className="text-sm text-gray-500">Select a report to view details</p>
    </div>
  )

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'content', label: 'Report',  icon: FileText },
    { key: 'thread',  label: 'Thread',  icon: MessageSquare, count: comments.length },
    { key: 'history', label: 'History', icon: History, count: versions.length },
  ]

  const fields = [
    { label: 'Activities Summary',  value: report.activities_summary },
    { label: 'Successes & Wins',    value: report.successes },
    { label: 'Challenges Faced',    value: report.challenges },
    { label: 'Prayer Items',        value: report.prayer_items },
    { label: 'Upcoming Plans',      value: report.upcoming_plans },
    { label: 'Remarks',             value: report.remarks },
  ].filter(f => f.value)

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={report.status} />
            <span className="text-xs text-gray-500 capitalize">
              {report.report_type} report
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-1.5 leading-tight">{report.title}</h2>
          <p className="text-xs text-gray-500 mt-1">
            {report.submitter_name}
            {report.submitter_unit && ` · ${report.submitter_unit}`}
            {' · '}
            Week of {new Date(report.week_of).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <button onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors p-1 flex-shrink-0">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors
              border-b-2 flex-1 justify-center
              ${tab === t.key
                ? 'text-white border-[#B8860B]'
                : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}>
            <t.icon size={12} />
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="bg-white/10 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '65vh' }}>

        {/* Report Content */}
        {tab === 'content' && (
          <div className="space-y-5">
            {/* Stats row */}
            {report.attendance_count != null && (
              <div className="bg-[#060E1A] border border-white/5 rounded-xl px-4 py-3
                              flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20
                                flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">👥</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Attendance</p>
                  <p className="text-lg font-bold text-white">{report.attendance_count}</p>
                </div>
              </div>
            )}

            {/* Fields */}
            {fields.map(f => (
              <div key={f.label}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {f.label}
                </p>
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{f.value}</p>
              </div>
            ))}

            {/* Attachment */}
            {report.attachment_url && (
              <div className="border-t border-white/5 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Attachment
                </p>
                <a href={report.attachment_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#060E1A] border border-white/10 rounded-xl
                             px-4 py-3 hover:border-blue-500/30 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20
                                  flex items-center justify-center flex-shrink-0">
                    <Paperclip size={14} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                      {report.attachment_name ?? 'Download'}
                    </p>
                    <p className="text-xs text-gray-500">Click to download</p>
                  </div>
                </a>
              </div>
            )}

            {/* Resubmit section */}
            {canResubmit && (
              <div className="border-t border-amber-500/20 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit2 size={14} className="text-amber-400" />
                    <p className="text-sm font-semibold text-amber-400">Edit & Resubmit</p>
                  </div>
                  <button onClick={() => setShowResubmit(s => !s)}
                    className="text-xs text-gray-500 hover:text-white transition-colors">
                    {showResubmit ? 'Hide' : 'Show form'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You have been granted permission to edit and resubmit this report.
                  Update the fields below and click Resubmit.
                </p>
                {showResubmit && (
                  <ReportForm
                    mode="resubmit"
                    initialData={{
                      week_of:              report.week_of,
                      title:                report.title,
                      attendance_count:     report.attendance_count?.toString() ?? '',
                      activities_summary:   report.activities_summary ?? '',
                      successes:            report.successes ?? '',
                      challenges:           report.challenges ?? '',
                      prayer_items:         report.prayer_items ?? '',
                      upcoming_plans:       report.upcoming_plans ?? '',
                      remarks:              report.remarks ?? '',
                      attachment_url:       report.attachment_url ?? '',
                      attachment_name:      report.attachment_name ?? '',
                    }}
                    saving={saving}
                    onSave={async (_, data) => { await onResubmit(data); setShowResubmit(false) }}
                    onCancel={() => setShowResubmit(false)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Thread */}
        {tab === 'thread' && (
          <ThreadPanel
            comments={comments}
            canComment={isReviewer}
            reportStatus={report.status}
            onSubmit={onFeedback}
            currentUserId={currentUserId}
          />
        )}

        {/* History */}
        {tab === 'history' && (
          <HistoryPanel versions={versions} />
        )}
      </div>
    </div>
  )
}
