// src/app/admin/reports/components/ReportForm.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Save, RotateCcw, Paperclip, X, Upload } from 'lucide-react'

interface ReportFormData {
  week_of:            string
  title:              string
  attendance_count:   string
  activities_summary: string
  successes:          string
  challenges:         string
  prayer_items:       string
  upcoming_plans:     string
  remarks:            string
  attachment_url:     string
  attachment_name:    string
  attachment_public_id: string
}

interface Props {
  mode:        'create' | 'resubmit'
  initialData?: Partial<ReportFormData>
  saving:      boolean
  onSave:      (action: 'draft' | 'submit' | 'resubmit', data: ReportFormData) => Promise<void>
  onCancel?:   () => void
}

function getMondayOf(): string {
  const d   = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return d.toISOString().split('T')[0]
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputCls = `w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 text-sm
  text-white placeholder:text-gray-600 focus:outline-none focus:border-[#1E3A8A]/60
  focus:ring-1 focus:ring-[#1E3A8A]/30 transition-all`

const textareaCls = `${inputCls} resize-none`

export default function ReportForm({ mode, initialData, saving, onSave, onCancel }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [weekOf,        setWeekOf]        = useState(initialData?.week_of         ?? getMondayOf())
  const [title,         setTitle]         = useState(initialData?.title            ?? '')
  const [attendance,    setAttendance]    = useState(initialData?.attendance_count ?? '')
  const [activities,    setActivities]    = useState(initialData?.activities_summary ?? '')
  const [successes,     setSuccesses]     = useState(initialData?.successes        ?? '')
  const [challenges,    setChallenges]    = useState(initialData?.challenges       ?? '')
  const [prayerItems,   setPrayerItems]   = useState(initialData?.prayer_items     ?? '')
  const [upcomingPlans, setUpcomingPlans] = useState(initialData?.upcoming_plans   ?? '')
  const [remarks,       setRemarks]       = useState(initialData?.remarks          ?? '')
  const [attachUrl,     setAttachUrl]     = useState(initialData?.attachment_url   ?? '')
  const [attachName,    setAttachName]    = useState(initialData?.attachment_name  ?? '')
  const [attachId,      setAttachId]      = useState(initialData?.attachment_public_id ?? '')
  const [uploading,     setUploading]     = useState(false)
  const [uploadErr,     setUploadErr]     = useState('')

  // Sync initial data when it changes (for resubmit pre-fill)
  useEffect(() => {
    if (!initialData) return
    if (initialData.week_of)            setWeekOf(initialData.week_of)
    if (initialData.title)              setTitle(initialData.title)
    if (initialData.attendance_count)   setAttendance(initialData.attendance_count)
    if (initialData.activities_summary) setActivities(initialData.activities_summary)
    if (initialData.successes)          setSuccesses(initialData.successes)
    if (initialData.challenges)         setChallenges(initialData.challenges)
    if (initialData.prayer_items)       setPrayerItems(initialData.prayer_items)
    if (initialData.upcoming_plans)     setUpcomingPlans(initialData.upcoming_plans)
    if (initialData.remarks)            setRemarks(initialData.remarks)
    if (initialData.attachment_url)     setAttachUrl(initialData.attachment_url)
    if (initialData.attachment_name)    setAttachName(initialData.attachment_name)
    if (initialData.attachment_public_id) setAttachId(initialData.attachment_public_id)
  }, [initialData?.week_of])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadErr('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res  = await fetch('/api/v1/admin/reports/upload', { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setAttachUrl(data.url)
      setAttachName(data.filename)
      setAttachId(data.public_id)
    } catch (e: unknown) {
      setUploadErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function buildData(): ReportFormData {
    return {
      week_of:              weekOf,
      title:                title.trim() || `Weekly Report - Week of ${weekOf}`,
      attendance_count:     attendance,
      activities_summary:   activities,
      successes,
      challenges,
      prayer_items:         prayerItems,
      upcoming_plans:       upcomingPlans,
      remarks,
      attachment_url:       attachUrl,
      attachment_name:      attachName,
      attachment_public_id: attachId,
    }
  }

  return (
    <div className="space-y-5">
      {/* Title + Week */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Field label="Report Title">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder={`Weekly Report - Week of ${weekOf}`}
              className={inputCls} />
          </Field>
        </div>
        <Field label="Week Of">
          <input type="date" value={weekOf} onChange={e => setWeekOf(e.target.value)}
            disabled={mode === 'resubmit'}
            className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`} />
        </Field>
      </div>

      {/* Attendance */}
      <Field label="Attendance Count">
        <input type="number" value={attendance} onChange={e => setAttendance(e.target.value)}
          placeholder="Enter number" min="0"
          className={`${inputCls} max-w-[200px]`} />
      </Field>

      {/* Text fields */}
      <Field label="Activities Summary">
        <textarea value={activities} onChange={e => setActivities(e.target.value)}
          rows={4} placeholder="What activities took place this week?"
          className={textareaCls} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Successes & Wins">
          <textarea value={successes} onChange={e => setSuccesses(e.target.value)}
            rows={3} placeholder="Key wins this week..."
            className={textareaCls} />
        </Field>
        <Field label="Challenges Faced">
          <textarea value={challenges} onChange={e => setChallenges(e.target.value)}
            rows={3} placeholder="Difficulties encountered..."
            className={textareaCls} />
        </Field>
      </div>

      <Field label="Prayer Items">
        <textarea value={prayerItems} onChange={e => setPrayerItems(e.target.value)}
          rows={3} placeholder="Specific prayer requests for this week..."
          className={textareaCls} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Upcoming Plans">
          <textarea value={upcomingPlans} onChange={e => setUpcomingPlans(e.target.value)}
            rows={3} placeholder="What is planned for next week?"
            className={textareaCls} />
        </Field>
        <Field label="Remarks">
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
            rows={3} placeholder="Any additional notes or remarks..."
            className={textareaCls} />
        </Field>
      </div>

      {/* File attachment */}
      <Field label="Attachment (Excel, CSV, PDF — max 10MB)">
        {attachUrl ? (
          <div className="flex items-center gap-3 bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20
                            flex items-center justify-center flex-shrink-0">
              <Paperclip size={14} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{attachName}</p>
              <a href={attachUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline">Download</a>
            </div>
            <button onClick={() => { setAttachUrl(''); setAttachName(''); setAttachId('') }}
              className="text-gray-500 hover:text-red-400 transition-colors p-1">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl
                       border-2 border-dashed border-white/10 text-sm text-gray-500
                       hover:border-[#1E3A8A]/50 hover:text-gray-300 hover:bg-[#1E3A8A]/5
                       transition-all disabled:opacity-50">
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
                Uploading...</>
            ) : (
              <><Upload size={16} /> Click to attach file</>
            )}
          </button>
        )}
        {uploadErr && <p className="text-xs text-red-400 mt-1">{uploadErr}</p>}
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf"
          onChange={handleUpload} className="hidden" />
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        {mode === 'resubmit' ? (
          <button onClick={() => onSave('resubmit', buildData())} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-[#B8860B] hover:bg-[#B8860B]/80 text-white transition-colors
                       disabled:opacity-50">
            <RotateCcw size={15} />
            {saving ? 'Resubmitting...' : 'Resubmit Report'}
          </button>
        ) : (
          <>
            <button onClick={() => onSave('submit', buildData())} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white transition-colors
                         disabled:opacity-50">
              <Send size={15} />
              {saving ? 'Submitting...' : 'Submit Report'}
            </button>
            <button onClick={() => onSave('draft', buildData())} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         border border-white/10 text-gray-300 hover:bg-white/5 transition-colors
                         disabled:opacity-50">
              <Save size={15} />
              Save Draft
            </button>
          </>
        )}
        {onCancel && (
          <button onClick={onCancel} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500
                       hover:text-white transition-colors">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
