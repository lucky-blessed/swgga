// src/components/admin/conference/MeetingCard.tsx
'use client'

import { useRouter } from 'next/navigation'
import {
  Calendar, Clock, Users, Video,
  ChevronRight, XCircle,
} from 'lucide-react'
import {
  type Meeting, type MeetingStatus,
  formatMeetingTime, getMeetingDuration,
  STATUS_CONFIG,
} from '@/hooks/admin/useConference'

interface MeetingCardProps {
  meeting:        Meeting
  currentUserId?: string
  canEdit?:       boolean
  onCancel?:      (id: string) => void
}

export default function MeetingCard({
  meeting,
  currentUserId,
  canEdit,
  onCancel,
}: MeetingCardProps) {
  const router     = useRouter()
  const cfg        = STATUS_CONFIG[meeting.status]
  const isLive     = meeting.status === 'in_progress'
  const isUpcoming = meeting.status === 'scheduled'
  const isCancelled = meeting.status === 'cancelled'

  const isParticipant = meeting.participants.some(
    p => p.user_id === currentUserId
  )

  const myParticipation = meeting.participants.find(
    p => p.user_id === currentUserId
  )

  const hasJoined = !!myParticipation?.joined_at

  return (
    <div
      onClick={() => router.push(`/admin/conference/${meeting.id}`)}
      className={`bg-[#0A1628] border rounded-2xl p-5 cursor-pointer
                  transition-all duration-200 hover:border-white/10
                  hover:bg-[#0F1E35] group
                  ${isLive
                    ? 'border-green-400/30 shadow-[0_0_20px_rgba(74,222,128,0.05)]'
                    : 'border-white/5'
                  }
                  ${isCancelled ? 'opacity-60' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Status badge */}
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
          <h3 className="text-white font-semibold text-sm leading-snug truncate">
            {meeting.title}
          </h3>
          <p className="text-[#64748B] text-xs mt-0.5">
            Scheduled by {meeting.created_by.name}
          </p>
        </div>
        <ChevronRight
          size={16}
          className="text-[#334155] group-hover:text-[#64748B] transition-colors flex-shrink-0 mt-1"
        />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[#64748B] text-xs">
          <Calendar size={12} className="flex-shrink-0" />
          <span>{formatMeetingTime(meeting.scheduled_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-[#64748B] text-xs">
          <Clock size={12} className="flex-shrink-0" />
          <span>
            {meeting.duration_minutes} min
            {' · '}Ends {getMeetingDuration(meeting.scheduled_time, meeting.duration_minutes)} WAT
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#64748B] text-xs">
          <Users size={12} className="flex-shrink-0" />
          <span>
            {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
            {meeting.participants.length > 0 && (
              <span className="ml-1 text-[#334155]">
                · {meeting.participants.slice(0, 3).map(p => p.name.split(' ')[0]).join(', ')}
                {meeting.participants.length > 3 && ` +${meeting.participants.length - 3}`}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Notes preview */}
      {meeting.notes && (
        <p className="text-[#334155] text-xs mb-4 line-clamp-2 italic">
          {meeting.notes}
        </p>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">

        {/* Join button */}
        {(isLive || isUpcoming) && isParticipant && (
          <button
            onClick={e => {
              e.stopPropagation()
              router.push(`/admin/conference/${meeting.id}`)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                        transition-colors
                        ${isLive
                          ? 'bg-green-400/20 border border-green-400/30 text-green-400 hover:bg-green-400/30'
                          : 'bg-[#1E3A8A]/20 border border-[#1E3A8A]/30 text-[#93C5FD] hover:bg-[#1E3A8A]/30'
                        }`}
          >
            <Video size={11} />
            {isLive ? 'Join Now' : 'View & Join'}
          </button>
        )}

        {/* Already joined indicator */}
        {hasJoined && meeting.status === 'completed' && (
          <span className="text-[#334155] text-xs">
            ✓ You attended
          </span>
        )}

        {/* Cancel button - R01/R02 only, scheduled meetings only */}
        {canEdit && isUpcoming && onCancel && (
          <button
            onClick={e => {
              e.stopPropagation()
              onCancel(meeting.id)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                       text-red-400/60 hover:text-red-400 border border-transparent
                       hover:border-red-400/20 hover:bg-red-400/5 transition-colors ml-auto"
          >
            <XCircle size={11} /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}