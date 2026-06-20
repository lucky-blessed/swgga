'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Video, Calendar } from 'lucide-react'
import { useMyMeetingInvites, formatMeetingTime, type MeetingInvite } from '@/hooks/admin/useConference'

const SESSION_KEY = 'swgga_seen_meeting_invites'

function getSeenIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function markSeen(ids: string[]) {
  try {
    const seen = getSeenIds()
    ids.forEach(id => seen.add(id))
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...seen]))
  } catch {
  }
}

export default function MeetingInviteWidget() {
  const router = useRouter()
  const { data: invites = [] } = useMyMeetingInvites()
  const hasToastedRef = useRef(false)

  useEffect(() => {
    if (invites.length === 0) return
    const seen   = getSeenIds()
    const unseen = invites.filter(inv => !seen.has(inv.id))
    if (unseen.length === 0) return
    const next = unseen[0]
    toast(
      `📅 Meeting Invite: ${next.title}`,
      {
        description: `${formatMeetingTime(next.scheduled_time)} WAT · Invited by ${next.invited_by}`,
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => router.push(`/admin/conference/${next.id}`),
        },
      }
    )
    markSeen(unseen.map(i => i.id))
  }, [invites, router])

  if (invites.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-30 w-72 space-y-2 max-h-[60vh] overflow-y-auto">
      {invites.slice(0, 3).map((inv: MeetingInvite) => (
        <button
          key={inv.id}
          onClick={() => router.push(`/admin/conference/${inv.id}`)}
          className={`w-full text-left bg-[#0A1628] border rounded-xl p-3.5
                      shadow-lg hover:border-white/15 transition-colors
                      ${inv.status === 'in_progress'
                        ? 'border-green-400/30'
                        : 'border-[#1E3A8A]/30'
                      }`}
        >
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                            ${inv.status === 'in_progress'
                              ? 'bg-green-400/15 text-green-400'
                              : 'bg-[#1E3A8A]/20 text-[#93C5FD]'
                            }`}>
              <Video size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{inv.title}</p>
              <div className="flex items-center gap-1 text-[#64748B] text-[11px] mt-0.5">
                <Calendar size={10} />
                <span className="truncate">{formatMeetingTime(inv.scheduled_time)} WAT</span>
              </div>
              <p className="text-[#475569] text-[11px] mt-0.5">
                {inv.status === 'in_progress' ? '🟢 Live now' : `Invited by ${inv.invited_by}`}
              </p>
            </div>
          </div>
        </button>
      ))}
      {invites.length > 3 && (
        <button
          onClick={() => router.push('/admin/conference')}
          className="w-full text-center text-[#64748B] hover:text-white text-xs py-2
                     bg-[#0A1628] border border-white/5 rounded-xl transition-colors"
        >
          +{invites.length - 3} more meeting{invites.length - 3 !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}
