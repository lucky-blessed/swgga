// src/app/admin/conference/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Video, Users, Calendar, Clock, ArrowLeft,
  Loader2, CheckCircle2, XCircle, Copy, ExternalLink,
  Mic, MicOff,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import { type MeetingStatus,
    useMeeting, useUpdateMeeting, useCancelMeeting,
  formatMeetingTime, getMeetingDuration, STATUS_CONFIG,
  type MeetingParticipant,
} from '@/hooks/admin/useConference'
import JitsiRoom from '@/components/admin/conference/JitsiRoom'

export default function MeetingDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const { user } = useAdminUser()
  const id       = params.id as string

  const canEdit    = ['R01', 'R02'].includes(String(user?.role ?? ''))
  const isAdmin    = canEdit

  const { data, isLoading, refetch } = useMeeting(id)
  const updateMutation = useUpdateMeeting()
  const cancelMutation = useCancelMeeting()

  const [showJitsi,     setShowJitsi]     = useState(false)
  const [showCancel,    setShowCancel]    = useState(false)
  const [copied,        setCopied]        = useState(false)
  const [statusError,   setStatusError]   = useState('')

  const meeting = data?.meeting

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[#64748B]" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#64748B]">Meeting not found.</p>
        <button
          onClick={() => router.push('/admin/conference')}
          className="mt-4 text-[#93C5FD] text-sm hover:underline"
        >
          Back to Conference Room
        </button>
      </div>
    )
  }

  const cfg          = STATUS_CONFIG[meeting.status as MeetingStatus]
  const isLive       = meeting.status === 'in_progress'
  const isScheduled  = meeting.status === 'scheduled'
  const isOver       = ['completed', 'cancelled'].includes(meeting.status)

  const isParticipant = meeting.participants.some(
    (p: MeetingParticipant) => p.user_id === user?.id
  )

  const canJoin = (isLive || isScheduled) && isParticipant

  function copyLink() {
    if (meeting.meeting_url) {
      navigator.clipboard.writeText(meeting.meeting_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function markCompleted() {
    setStatusError('')
    try {
      await updateMutation.mutateAsync({ id, status: 'completed' })
      refetch()
    } catch (e: any) {
      setStatusError(e.message)
    }
  }

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync(id)
      setShowCancel(false)
      router.push('/admin/conference')
    } catch (e: any) {
      setStatusError(e.message)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">

      {/* Back */}
      <button
        onClick={() => router.push('/admin/conference')}
        className="flex items-center gap-2 text-[#64748B] hover:text-white
                   text-sm transition-colors"
      >
        <ArrowLeft size={14} /> Conference Room
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                              rounded-full border text-xs font-bold
                              ${cfg.bg} ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            {meeting.recording_enabled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               bg-red-400/10 border border-red-400/20 text-red-400
                               text-[10px] font-bold">
                ● REC
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            {meeting.title}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Scheduled by {meeting.created_by.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canJoin && !showJitsi && (
            <button
              onClick={() => setShowJitsi(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl
                          font-semibold text-sm transition-colors
                          ${isLive
                            ? 'bg-green-400/20 border border-green-400/30 text-green-400 hover:bg-green-400/30'
                            : 'bg-[#1E3A8A] hover:bg-[#1e40af] text-white'
                          }`}
            >
              <Video size={15} />
              {isLive ? 'Join Live Meeting' : 'Join Meeting'}
            </button>
          )}

          {showJitsi && (
            <button
              onClick={() => setShowJitsi(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-red-500/20 border border-red-500/30 text-red-400
                         text-sm hover:bg-red-500/30 transition-colors"
            >
              <XCircle size={15} /> Leave Meeting
            </button>
          )}
        </div>
      </div>

      {/* Jitsi Room */}
      {showJitsi && meeting.jitsi_room_id && (
        <div className="rounded-2xl overflow-hidden" style={{ height: '600px' }}>
          <JitsiRoom
            meetingId={id}
            roomId={meeting.jitsi_room_id}
            displayName={user?.name ?? 'SWGGA Member'}
            onLeave={() => setShowJitsi(false)}
          />
        </div>
      )}

      {/* Meeting Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Details card */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-[#64748B] uppercase tracking-wider">
            Meeting Details
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={14} className="text-[#64748B] flex-shrink-0" />
              <span className="text-white text-sm">
                {formatMeetingTime(meeting.scheduled_time)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-[#64748B] flex-shrink-0" />
              <span className="text-white text-sm">
                {meeting.duration_minutes} minutes
                {' · '}Ends at {getMeetingDuration(
                  meeting.scheduled_time,
                  meeting.duration_minutes
                )} WAT
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users size={14} className="text-[#64748B] flex-shrink-0" />
              <span className="text-white text-sm">
                {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Meeting URL - R01/R02 only */}
          {isAdmin && meeting.meeting_url && (
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs text-[#64748B] mb-2">Meeting Link</p>
              <div className="flex items-center gap-2 bg-[#060E1A] border border-white/5
                              rounded-xl px-3 py-2">
                <span className="text-[#64748B] text-xs truncate flex-1 font-mono">
                  {meeting.meeting_url}
                </span>
                <button
                  onClick={copyLink}
                  className="text-[#64748B] hover:text-white flex-shrink-0 transition-colors"
                >
                  {copied
                    ? <CheckCircle2 size={14} className="text-green-400" />
                    : <Copy size={14} />
                  }
                </button>
                
                  <a
                  href={meeting.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#64748B] hover:text-white flex-shrink-0 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {meeting.notes && (
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs text-[#64748B] mb-2">Agenda / Notes</p>
              <p className="text-white text-sm leading-relaxed">{meeting.notes}</p>
            </div>
          )}
        </div>

        {/* Participants card */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-4">
            Participants
          </p>
          {meeting.participants.length === 0 ? (
            <p className="text-[#334155] text-sm">No participants added yet.</p>
          ) : (
            <div className="space-y-3">
              {meeting.participants.map((p: MeetingParticipant) => {
                const initials = p.name.split(' ').slice(0, 2)
                  .map((n: string) => n[0]).join('').toUpperCase()
                const hasJoined = !!p.joined_at
                const hasLeft   = !!p.left_at

                return (
                  <div key={p.id}
                       className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#1E3A8A]/20 border
                                    border-[#1E3A8A]/30 flex items-center justify-center
                                    flex-shrink-0">
                      <span className="text-[#93C5FD] text-xs font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{p.name}</p>
                      {p.category && (
                        <p className="text-[#334155] text-xs">{p.category}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {hasJoined && !hasLeft && (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <Mic size={10} /> Live
                        </span>
                      )}
                      {hasJoined && hasLeft && (
                        <span className="flex items-center gap-1 text-[#64748B] text-xs">
                          <MicOff size={10} /> Left
                        </span>
                      )}
                      {!hasJoined && (
                        <span className="text-[#334155] text-xs">Not joined</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status error */}
      {statusError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                        px-4 py-3 text-red-400 text-sm">
          {statusError}
        </div>
      )}

      {/* Admin actions */}
      {canEdit && !isOver && (
        <div className="flex items-center gap-3 pt-2">
          {isScheduled && (
            <button
              onClick={async () => {
                setStatusError('')
                try {
                  await updateMutation.mutateAsync({ id, status: 'in_progress' })
                  refetch()
                } catch (e: any) {
                  setStatusError(e.message)
                }
              }}
              disabled={updateMutation.status === 'pending'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-green-400/20 border border-green-400/30
                         text-green-400 text-sm hover:bg-green-400/30
                         transition-colors disabled:opacity-50"
            >
              <Video size={14} /> Start Meeting
            </button>
          )}
          {isLive && (
            <button
              onClick={markCompleted}
              disabled={updateMutation.status === 'pending'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                         text-[#93C5FD] text-sm hover:bg-[#1E3A8A]/30
                         transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Mark as Completed
            </button>
          )}
          {isScheduled && (
            <button
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         text-red-400/60 hover:text-red-400 border border-transparent
                         hover:border-red-400/20 hover:bg-red-400/5 text-sm transition-colors"
            >
              <XCircle size={14} /> Cancel Meeting
            </button>
          )}
        </div>
      )}

      {/* Cancel confirm */}
      {showCancel && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40"
               onClick={() => setShowCancel(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl
                            w-full max-w-sm p-6 space-y-4">
              <h3 className="text-white font-semibold">Cancel This Meeting?</h3>
              <p className="text-[#64748B] text-sm">
                This will cancel the meeting permanently. All participants
                will be notified.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancel(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10
                             text-[#64748B] hover:text-white text-sm transition-colors"
                >
                  Keep It
                </button>
                <button
                  onClick={handleCancel}
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
    </div>
  )
}