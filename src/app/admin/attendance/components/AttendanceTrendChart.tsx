'use client'
// src/app/admin/attendance/components/AttendanceTrendChart.tsx

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { ServiceRecord } from '@/hooks/admin/useAttendance'

const SERVICE_COLORS: Record<string, string> = {
  sunday_service:      '#1E3A8A',
  word_feast:          '#B8860B',
  moment_of_encounter: '#0E7490',
  healing_streams:     '#15803D',
  special:             '#7C3AED',
}

const SERVICE_LABEL: Record<string, string> = {
  sunday_service:      'Sunday Service',
  word_feast:          'Word Feast',
  moment_of_encounter: 'Moment of Encounter',
  healing_streams:     'Healing Streams',
  special:             'Special Service',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 space-y-1.5 shadow-xl">
      <p className="text-xs font-semibold text-gray-400">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-bold">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

interface Props { records: ServiceRecord[] }

export default function AttendanceTrendChart({ records }: Props) {
  // Group by date, then by service type
  const dateMap: Record<string, Record<string, number>> = {}
  const serviceTypes = new Set<string>()

  for (const r of [...records].sort((a, b) => a.service_date.localeCompare(b.service_date))) {
    const date = r.service_date.slice(5) // MM-DD
    if (!dateMap[date]) dateMap[date] = {}
    dateMap[date][r.service_type] = r.total_count
    serviceTypes.add(r.service_type)
  }

  const data = Object.entries(dateMap).map(([date, vals]) => ({
    date,
    ...vals,
    total: Object.values(vals).reduce((s, v) => s + v, 0),
  }))

  const types = [...serviceTypes]

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-bold text-white">Attendance Trend</p>
          <p className="text-xs text-gray-500 mt-0.5">Service attendance over time</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            {types.map(t => (
              <linearGradient key={t} id={`grad-${t}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={SERVICE_COLORS[t] ?? '#1E3A8A'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={SERVICE_COLORS[t] ?? '#1E3A8A'} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#0F2035" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#94A3B8', fontSize: 11 }}>
                {SERVICE_LABEL[value] ?? value}
              </span>
            )}
          />
          {types.map(t => (
            <Area key={t} type="monotone" dataKey={t}
              name={SERVICE_LABEL[t] ?? t}
              stroke={SERVICE_COLORS[t] ?? '#1E3A8A'}
              fill={`url(#grad-${t})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
