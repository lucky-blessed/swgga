'use client'

import { useState, useEffect } from 'react'

// --- Types ---

interface Leader {
  id:    string
  name:  string
  email: string | null
  phone: string | null
}

interface CellGroup {
  id:          string
  name:        string
  location:    string | null
  meeting_day: string | null
  is_active:   boolean
  created_at:  string
  leader:      Leader | null
}

// --- Helpers ---

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getNextMeetingDate(meetingDay: string): string {
  const today    = new Date()
  const todayDay = today.getDay()
  const targetDay = DAY_ORDER.indexOf(meetingDay)
  if (targetDay === -1) return meetingDay

  let daysUntil = targetDay - todayDay
  if (daysUntil <= 0) daysUntil += 7

  const next = new Date(today)
  next.setDate(today.getDate() + daysUntil)

  return next.toLocaleDateString('en-GB', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })
}

function buildWhatsApp(phone: string, groupName: string): string {
  const msg = `Hello, I'm reaching out regarding the ${groupName} Impact Fellowship Impact Fellowship.`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// --- Page ---

export default function PortalCellGroupPage() {
  const [cellGroup, setCellGroup] = useState<CellGroup | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    fetch('/api/v1/members/cell-group', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setCellGroup(data.cell_group ?? null)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load Impact Fellowship information.')
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-playfair">Impact Fellowship</h1>
        <p className="text-sm text-gray-400 mt-1">
          Your Impact Fellowship Impact Fellowship information
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 animate-pulse space-y-4">
            <div className="h-6 bg-white/5 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-4 bg-white/5 rounded w-2/5" />
          </div>
          <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 animate-pulse space-y-4">
            <div className="h-5 bg-white/5 rounded w-1/4" />
            <div className="h-4 bg-white/5 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-1/4" />
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Not assigned */}
      {!loading && !error && !cellGroup && (
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#B8860B]/10 border border-[#B8860B]/20
                          flex items-center justify-center mx-auto">
            <span className="text-2xl">🏘️</span>
          </div>
          <div>
            <h2 className="text-white font-semibold font-playfair text-lg mb-2">
              Not yet assigned to a Impact Fellowship
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              You have not been assigned to an Impact Fellowship Impact Fellowship yet.
              Please speak with a church administrator or your pastor to get connected.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="https://wa.me/channel/0029VbB8W8k2f3ELvngFmd3W"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                         bg-green-500/10 text-green-400 border border-green-500/20
                         text-sm font-semibold hover:bg-green-500/20 transition-colors"
            >
              <WaIcon />
              Contact Us on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Cell group info */}
      {!loading && !error && cellGroup && (
        <div className="space-y-4">

          {/* Main card */}
          <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border
                                   bg-[#B8860B]/10 text-[#F5C518] border-[#B8860B]/20">
                    Impact Fellowship
                  </span>
                  {!cellGroup.is_active && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border
                                     bg-gray-500/10 text-gray-400 border-gray-500/20">
                      Inactive
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white font-playfair mt-2">
                  {cellGroup.name}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/20
                              flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏘️</span>
              </div>
            </div>

            {/* Gold divider */}
            <div className="w-10 h-0.5 bg-[#B8860B] rounded-full" />

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cellGroup.meeting_day && (
                <div className="bg-[#060E1A] border border-white/5 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-500">Meeting Day</p>
                  <p className="text-white font-semibold">{cellGroup.meeting_day}s</p>
                  <p className="text-xs text-[#B8860B]">
                    Next: {getNextMeetingDate(cellGroup.meeting_day)}
                  </p>
                </div>
              )}
              {cellGroup.location && (
                <div className="bg-[#060E1A] border border-white/5 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-500">Meeting Location</p>
                  <p className="text-white font-semibold">{cellGroup.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Leader card */}
          {cellGroup.leader && (
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Fellowship Leader
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/30 border border-[#1E3A8A]/40
                                flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-[#93C5FD]">
                    {cellGroup.leader.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold font-playfair">
                    {cellGroup.leader.name}
                  </p>
                  {cellGroup.leader.email && (
                    <p className="text-xs text-gray-400 truncate">{cellGroup.leader.email}</p>
                  )}
                </div>
              </div>

              {/* Contact buttons */}
              <div className="flex gap-3 flex-wrap">
                {cellGroup.leader.phone && (
                  <a
                    href={buildWhatsApp(cellGroup.leader.phone, cellGroup.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                               bg-green-500/10 text-green-400 border border-green-500/20
                               text-sm font-semibold hover:bg-green-500/20 transition-colors"
                  >
                    <WaIcon />
                    WhatsApp Leader
                  </a>
                )}
                {cellGroup.leader.email && (
                  <a
                    href={`mailto:${cellGroup.leader.email}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                               bg-[#1E3A8A]/20 text-blue-300 border border-[#1E3A8A]/30
                               text-sm font-semibold hover:bg-[#1E3A8A]/30 transition-colors"
                  >
                    Email Leader
                  </a>
                )}
              </div>
            </div>
          )}

          {/* About Impact Fellowship */}
          <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              About Impact Fellowship
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Impact Fellowship is the Impact Fellowship ministry of Sure Word Glorious Gospel Assembly.
              Cell groups meet weekly across Warri and Effurun for fellowship, prayer, Bible study,
              and community support. They are the heartbeat of our local church family.
            </p>
            <a
              href="https://wa.me/channel/0029VbB8W8k2f3ELvngFmd3W"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#B8860B] hover:underline"
            >
              Join our WhatsApp channel
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
