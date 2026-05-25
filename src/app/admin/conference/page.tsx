// src/app/admin/conference/page.tsx
'use client'

import { useState } from 'react'
import {
  Video, Plus, Loader2, RefreshCw,
  Calendar, Users, ChevronDown,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useMeetings, useCreateMeeting, useCancelMeeting,
  type CreateMeetingPayload,
} from '@/hooks/admin/useConference'
import MeetingCard from '@/components/admin/conference/MeetingCard'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateMeetingPayload = {
  title:              '',
  scheduled_time:     '',
  duration_minutes:   60,
  recording_enabled:  false,
  notes:              null,
  participant_ids:    [],
}

const DURATION_OPTIONS = [
  { value: 30,  label: '30 minutes' },
  { value: 60,  label: '1 hour'     },
  { value: 90,  label: '1.5 hours'  },
  { value: 120, label: '2 hours'    },
  { value: 180, label: '3 hours'    },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConferencePage() {
  const { user }   = useAdminUser()
  const canCreate  = ['R01', 'R02'].includes(String(user?.role ?? ''))
  const canEdit    = canCreate

  // Upcoming meetings
  const {
    data:       upcomingData,
    isLoading:  upcomingLoading,
    refetch:    refetchUpcoming,
    isFetching: upcomingFetching,
  } = useMeetings({ filter: 'upcoming', limit: 20 })

  // Past meetings
  const {
    data:      pastData,
    isLoading: pastLoading,
    refetch:   refetchPast,
  } = useMeetings({ filter: 'past', limit: 10 })

  const createMutation = useCreateMeeting()
  const cancelMutation = useCancelMeeting()

  const upcomingMeetings = upcomingData?.meetings ?? []
  const pastMeetings     = pastData?.meetings     ?? []

  // Modal state
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState<CreateMeetingPayload>(EMPTY_FORM)
  const [formError,  setFormError]  = useState('')

  // Confirm cancel
  const [cancelId, setCancelId] = useState<string | null>(null)

  function openModal() {
    // Default scheduled time to next hour
    const next = new Date()
    next.setHours(next.getHours() + 1, 0, 0, 0)
    setForm({
      ...EMPTY_FORM,
      scheduled_time: next.toISOString().slice(0, 16),
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleCreate() {
    setFormError('')
    if (!form.title?.trim()) { setFormError('Title is required.');          return }
    if (!form.scheduled_time) { setFormError('Scheduled time is required.'); return }

    // datetime-local is local time — append timezone offset to parse correctly
    const scheduledDate = new Date(form.scheduled_time)
    const nowMinus5Min  = new Date(Date.now() - 5 * 60 * 1000)
    if (scheduledDate <= nowMinus5Min) {
      setFormError('Scheduled time must be in the future.')
      return
  }

    try {
      await createMutation.mutateAsync(form)
      setShowModal(false)
      refetchUpcoming()
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to create meeting.')
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelMutation.mutateAsync(id)
      setCancelId(null)
      refetchUpcoming()
      refetchPast()
    } catch (e: any) {
      console.error('Cancel failed:', e.message)
    }
  }

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Conference Room
          </h1>
          <p className="text-[#64748B] text-sm mt-0.5">
            SWGGA Leadership Video Meetings · Powered by Jitsi Meet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { refetchUpcoming(); refetchPast() }}
            className="w-9 h-9 rounded-xl bg-[#0A1628] border border-white/5
                       hover:border-white/15 flex items-center justify-center
                       text-[#64748B] hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={upcomingFetching ? 'animate-spin' : ''} />
          </button>
          {canCreate && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A8A]
                         hover:bg-[#1e40af] text-white text-sm transition-colors"
            >
              <Plus size={15} /> Schedule Meeting
            </button>
          )}
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-[#64748B]" />
          <h2 className="text-white font-medium text-sm">Upcoming Meetings</h2>
          {upcomingMeetings.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#1E3A8A]/20
                             text-[#93C5FD] text-xs font-bold">
              {upcomingMeetings.length}
            </span>
          )}
        </div>

        {upcomingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#64748B]" />
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-12
                          flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F1E35] border border-white/5
                            flex items-center justify-center">
              <Video size={24} className="text-[#334155]" />
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm font-medium mb-1">
                No upcoming meetings
              </p>
              <p className="text-[#334155] text-xs">
                {canCreate
                  ? 'Schedule a meeting to get started'
                  : 'You have no upcoming meetings scheduled'
                }
              </p>
            </div>
            {canCreate && (
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                           text-[#93C5FD] text-sm hover:bg-[#1E3A8A]/30 transition-colors"
              >
                <Plus size={14} /> Schedule Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingMeetings.map((meeting: any) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                currentUserId={user?.id}
                canEdit={canEdit}
                onCancel={id => setCancelId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {(pastMeetings.length > 0 || !pastLoading) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-[#64748B]" />
            <h2 className="text-white font-medium text-sm">Past Meetings</h2>
            {pastMeetings.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/5
                               text-[#64748B] text-xs font-bold">
                {pastMeetings.length}
              </span>
            )}
          </div>

          {pastLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#64748B]" />
            </div>
          ) : pastMeetings.length === 0 ? (
            <p className="text-[#334155] text-sm">No past meetings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pastMeetings.map((meeting: any) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  currentUserId={user?.id}
                  canEdit={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {cancelId && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40"
               onClick={() => setCancelId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl
                            w-full max-w-sm p-6 space-y-4">
              <h3 className="text-white font-semibold">Cancel Meeting?</h3>
              <p className="text-[#64748B] text-sm">
                This will cancel the meeting and notify all participants.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10
                             text-[#64748B] hover:text-white text-sm transition-colors"
                >
                  Keep Meeting
                </button>
                <button
                  onClick={() => handleCancel(cancelId)}
                  disabled={cancelMutation.status === 'pending'}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30
                             text-red-400 font-bold text-sm hover:bg-red-500/30
                             transition-colors disabled:opacity-50
                             flex items-center justify-center gap-2"
                >
                  {cancelMutation.status === 'pending'
                    ? <><Loader2 size={14} className="animate-spin" /> Cancelling...</>
                    : 'Yes, Cancel'
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Schedule Meeting Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40"
               onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl
                            w-full max-w-lg max-h-[90vh] flex flex-col">

              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-semibold">Schedule Meeting</h2>
                <button onClick={() => setShowModal(false)}
                        className="text-[#64748B] hover:text-white">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                                  px-4 py-3 text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">
                    Meeting Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Leadership Planning Meeting"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  />
                </div>

                {/* Date/Time + Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Date & Time (WAT) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.scheduled_time}
                      onChange={e => setForm(p => ({ ...p, scheduled_time: e.target.value }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">Duration</label>
                    <div className="relative">
                      <select
                        value={form.duration_minutes}
                        onChange={e => setForm(p => ({
                          ...p, duration_minutes: Number(e.target.value)
                        }))}
                        className="w-full appearance-none bg-[#060E1A] border border-white/10
                                   rounded-xl px-3 pr-8 py-2 text-white text-sm
                                   focus:outline-none focus:border-[#1E3A8A]"
                      >
                        {DURATION_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2
                                   text-[#64748B] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Agenda / Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes ?? ''}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value || null }))}
                    placeholder="Optional agenda or meeting notes…"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A] resize-none"
                  />
                </div>

                {/* Recording toggle */}
                <div className="flex items-center justify-between bg-[#060E1A]
                                border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm">Recording Reminder</p>
                    <p className="text-[#334155] text-xs">
                      Sends "this meeting will be recorded" SMS to participants
                    </p>
                  </div>
                  <button
                    onClick={() => setForm(p => ({
                      ...p, recording_enabled: !p.recording_enabled
                    }))}
                    className={`w-10 h-5 rounded-full transition-colors relative
                                ${form.recording_enabled ? 'bg-[#1E3A8A]' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                      transition-transform
                                      ${form.recording_enabled
                                        ? 'translate-x-5'
                                        : 'translate-x-0.5'
                                      }`} />
                  </button>
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
                    ? <><Loader2 size={14} className="animate-spin" /> Creating...</>
                    : 'Schedule Meeting'
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