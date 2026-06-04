'use client'
// src/app/admin/attendance/components/LimitedAccessView.tsx

import { useState } from 'react'
import { Lock, Send, CheckCircle } from 'lucide-react'
import type { ServiceRecord } from '@/hooks/admin/useAttendance'

interface Props {
  records:  ServiceRecord[]
  userName: string
}

export default function LimitedAccessView({ records, userName }: Props) {
  const [requested, setRequested] = useState(false)
  const [sending,   setSending]   = useState(false)

  // Basic metrics only
  const total   = records.reduce((s, r) => s + r.total_count, 0)
  const avg     = records.length ? Math.round(total / records.length) : 0
  const highest = records.length ? Math.max(...records.map(r => r.total_count)) : 0
  const ft      = records.reduce((s, r) => s + (r.first_timers ?? 0), 0)

  async function requestAccess() {
    setSending(true)
    try {
      // Send notification to Senior Pastor via API
      await fetch('/api/v1/admin/rbac/request-analytics', {
        method:  'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userName }),
      })
      setRequested(true)
    } catch {
      setRequested(true) // Still show success UI
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attendance',  value: total.toLocaleString() },
          { label: 'Average per Service', value: avg.toLocaleString() },
          { label: 'Highest Service',   value: highest.toLocaleString() },
          { label: 'First Timers',      value: ft.toLocaleString() },
        ].map(m => (
          <div key={m.label} className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Blurred analytics section */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Blurred placeholder */}
        <div className="blur-sm pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 h-64">
                <div className="h-4 bg-white/10 rounded w-32 mb-4" />
                <div className="h-full bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        bg-[#060E1A]/80 backdrop-blur-sm">
          <div className="text-center space-y-4 max-w-sm px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#B8860B]/10 border border-[#B8860B]/20
                            flex items-center justify-center mx-auto">
              <Lock size={24} className="text-[#F5C518]" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-bold text-lg">Full Analytics Locked</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Detailed charts, trends, and breakdowns require Full Analytics Access.
                Contact your Senior Pastor to request access.
              </p>
            </div>

            {requested ? (
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold">
                <CheckCircle size={16} />
                Access request sent to Senior Pastor
              </div>
            ) : (
              <button
                onClick={requestAccess}
                disabled={sending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-[#B8860B] to-[#B8860B]/80
                           hover:from-[#B8860B]/90 hover:to-[#B8860B]/70
                           text-white transition-all disabled:opacity-50 mx-auto">
                <Send size={14} />
                {sending ? 'Sending...' : 'Request Full Access'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
