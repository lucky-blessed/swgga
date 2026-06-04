// src/components/admin/attendance/ServiceRecordDrawer.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Pencil, Save, Loader2 } from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useUpdateServiceRecord,
  type ServiceRecord,
  type ServiceType,
} from '@/hooks/admin/useAttendance'

const SERVICE_LABEL: Record<string, string> = {
  sunday_service:      'Sunday Service',
  word_feast:          'Word Feast',
  moment_of_encounter: 'Moment of Encounter',
  healing_streams:     'Healing Streams',
  special:             'Special Service',
}

interface Props {
  record:   ServiceRecord | null
  onClose:  () => void
}

export default function ServiceRecordDrawer({ record, onClose }: Props) {
  const { user } = useAdminUser()
  const canEdit        = ['R01', 'R03'].includes(String(user?.role ?? ''))
  const updateMutation = useUpdateServiceRecord()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    total_count:    0,
    men_count:      '' as number | '',
    women_count:    '' as number | '',
    children_count: '' as number | '',
    first_timers:   0,
    notes:          '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (record) {
      setForm({
        total_count:    record.total_count,
        men_count:      record.men_count      ?? '',
        women_count:    record.women_count    ?? '',
        children_count: record.children_count ?? '',
        first_timers:   record.first_timers   ?? 0,
        notes:          record.notes          ?? '',
      })
      setEditing(false)
      setError('')
    }
  }, [record])

  if (!record) return null

  function handleChange(field: string, value: string) {
    setForm(prev => ({
      ...prev,
      [field]: value === '' ? '' : isNaN(Number(value)) ? value : Number(value),
    }))
  }

  async function handleSave() {
    setError('')
    if (!form.total_count || Number(form.total_count) < 0) {
      setError('Total count is required and must be 0 or more.')
      return
    }
    try {
      await updateMutation.mutateAsync({
        id:             record!.id,
        total_count:    Number(form.total_count),
        men_count:      form.men_count      === '' ? null : Number(form.men_count),
        women_count:    form.women_count    === '' ? null : Number(form.women_count),
        children_count: form.children_count === '' ? null : Number(form.children_count),
        first_timers:   Number(form.first_timers),
        notes:          form.notes || null,
      })
      setEditing(false)
    } catch (e: any) {
      setError(e.message ?? 'Failed to update record.')
    }
  }

  const field = (label: string, key: string, hint?: string) => (
    <div>
      <label className="block text-xs text-[#64748B] mb-1">{label}</label>
      {editing ? (
        <input
          type="number"
          min={0}
          value={form[key as keyof typeof form]}
          onChange={e => handleChange(key, e.target.value)}
          className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
        />
      ) : (
        <p className="text-white text-sm">
        {String(record[key as keyof ServiceRecord] ?? '') || <span className="text-[#334155]">—</span>}        </p>
      )}
      {hint && <p className="text-xs text-[#334155] mt-0.5">{hint}</p>}
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A1628] border-l border-white/5 z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-white font-semibold">
              {SERVICE_LABEL[record.service_type]}
            </h2>
            <p className="text-[#64748B] text-sm">{record.service_date}</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3A8A] text-white text-sm hover:bg-[#1e40af] transition-colors"
              >
                <Pencil size={13} /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-[#64748B] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Counts */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">Attendance Counts</p>
            <div className="grid grid-cols-2 gap-4">
              {field('Total Present *', 'total_count')}
              {field('First Timers',    'first_timers')}
              {field('Men',             'men_count')}
              {field('Women',           'women_count')}
              {field('Children',        'children_count')}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">Notes</p>
            {editing ? (
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
                className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1E3A8A] resize-none"
              />
            ) : (
              <p className="text-white text-sm">
                {record.notes ?? <span className="text-[#334155]">No notes</span>}
              </p>
            )}
          </div>

          {/* Meta */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">Record Info</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B] text-sm">Recorded by</span>
                <span className="text-white text-sm">{record.recorded_by.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] text-sm">Created</span>
                <span className="text-white text-sm">
                  {new Date(record.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {editing && (
          <div className="px-6 py-4 border-t border-white/5 flex gap-3">
            <button
              onClick={() => { setEditing(false); setError('') }}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#64748B] hover:text-white hover:border-white/20 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.status === 'pending'}
              className="flex-1 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#F5C518] text-black font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
            {updateMutation.status === 'pending'
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : <><Save size={14} /> Save Changes</>
              }
            </button>
          </div>
        )}
      </div>
    </>
  )
}