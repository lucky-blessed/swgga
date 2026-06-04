'use client'
// src/app/admin/attendance/components/AttendanceTables.tsx

import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import type { ServiceRecord } from '@/hooks/admin/useAttendance'

const SERVICE_LABEL: Record<string, string> = {
  sunday_service:      'Sunday Service',
  word_feast:          'Word Feast',
  moment_of_encounter: 'Moment of Encounter',
  healing_streams:     'Healing Streams',
  special:             'Special Service',
}

const SERVICE_COLOR: Record<string, string> = {
  sunday_service:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  word_feast:          'bg-amber-500/10 text-amber-400 border-amber-500/20',
  moment_of_encounter: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  healing_streams:     'bg-green-500/10 text-green-400 border-green-500/20',
  special:             'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const TROPHY_COLORS = ['text-[#F5C518]', 'text-gray-400', 'text-amber-700']

interface Props { records: ServiceRecord[] }

export function TopServicesTable({ records }: Props) {
  const top5 = [...records]
    .sort((a, b) => b.total_count - a.total_count)
    .slice(0, 5)

  const maxCount = top5[0]?.total_count ?? 1

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={15} className="text-[#F5C518]" />
        <div>
          <p className="text-sm font-bold text-white">Top Services</p>
          <p className="text-xs text-gray-500">Best attended services in period</p>
        </div>
      </div>
      <div className="space-y-3">
        {top5.map((r, i) => {
          const pct = Math.round((r.total_count / maxCount) * 100)
          return (
            <div key={r.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy size={13} className={TROPHY_COLORS[i] ?? 'text-gray-600'} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                        ${SERVICE_COLOR[r.service_type] ?? 'bg-white/5 text-gray-400 border-white/10'}`}>
                        {SERVICE_LABEL[r.service_type] ?? r.service_type}
                      </span>
                      <span className="text-xs text-gray-500">{r.service_date}</span>
                    </div>
                    {r.notes && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">{r.notes}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-white flex-shrink-0">
                  {r.total_count.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#B8860B] rounded-full"
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        {top5.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No data available</p>
        )}
      </div>
    </div>
  )
}

export function RecentServicesTable({ records }: Props) {
  const sorted = [...records]
    .sort((a, b) => b.service_date.localeCompare(a.service_date))
    .slice(0, 10)

  function getGrowth(current: ServiceRecord, all: ServiceRecord[]) {
    const same = all
      .filter(r => r.service_type === current.service_type &&
                   r.service_date < current.service_date)
      .sort((a, b) => b.service_date.localeCompare(a.service_date))
    if (!same.length) return null
    const prev = same[0].total_count
    return prev > 0 ? Math.round(((current.total_count - prev) / prev) * 100) : null
  }

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <p className="text-sm font-bold text-white">Recent Services</p>
        <p className="text-xs text-gray-500 mt-0.5">Last 10 recorded services</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Date', 'Service', 'Total', 'Men', 'Women', 'Children', 'First Timers', 'Growth'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map(r => {
              const growth = getGrowth(r, records)
              return (
                <tr key={r.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{r.service_date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                      ${SERVICE_COLOR[r.service_type] ?? 'bg-white/5 text-gray-400 border-white/10'}`}>
                      {SERVICE_LABEL[r.service_type] ?? r.service_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{r.total_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.men_count ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.women_count ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.children_count ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.first_timers ?? 0}</td>
                  <td className="px-4 py-3">
                    {growth !== null ? (
                      <span className={`flex items-center gap-1 text-xs font-semibold
                        ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {growth >= 0
                          ? <TrendingUp size={11} />
                          : <TrendingDown size={11} />
                        }
                        {Math.abs(growth)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  No records in selected period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
