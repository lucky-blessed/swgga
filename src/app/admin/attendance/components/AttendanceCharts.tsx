'use client'
// src/app/admin/attendance/components/ServiceComparisonChart.tsx

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
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
  sunday_service:      'Sunday',
  word_feast:          'Word Feast',
  moment_of_encounter: 'Encounter',
  healing_streams:     'Healing',
  special:             'Special',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0]?.value?.toLocaleString()} avg attendance</p>
    </div>
  )
}

interface Props { records: ServiceRecord[] }

export function ServiceComparisonChart({ records }: Props) {
  const groups: Record<string, number[]> = {}
  for (const r of records) {
    if (!groups[r.service_type]) groups[r.service_type] = []
    groups[r.service_type].push(r.total_count)
  }

  const data = Object.entries(groups).map(([type, counts]) => ({
    type,
    label: SERVICE_LABEL[type] ?? type,
    avg:   Math.round(counts.reduce((s, c) => s + c, 0) / counts.length),
    max:   Math.max(...counts),
    count: counts.length,
  })).sort((a, b) => b.avg - a.avg)

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
      <div className="mb-5">
        <p className="text-sm font-bold text-white">Service Comparison</p>
        <p className="text-xs text-gray-500 mt-0.5">Average attendance per service type</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0F2035" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]} name="Avg Attendance">
            {data.map((entry) => (
              <Cell key={entry.type} fill={SERVICE_COLORS[entry.type] ?? '#1E3A8A'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Pie Chart ────────────────────────────────────────────────────────────────

import {
  PieChart, Pie, Cell as PieCell, Legend as PieLegend, Tooltip as PieTooltip
} from 'recharts'

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function AttendanceBreakdownPie({ records }: Props) {
  const groups: Record<string, number> = {}
  for (const r of records) {
    groups[r.service_type] = (groups[r.service_type] ?? 0) + r.total_count
  }

  const data = Object.entries(groups).map(([type, total]) => ({
    name:  SERVICE_LABEL[type] ?? type,
    type,
    value: total,
  }))

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
      <div className="mb-5">
        <p className="text-sm font-bold text-white">Attendance Breakdown</p>
        <p className="text-xs text-gray-500 mt-0.5">By service type</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80}
            dataKey="value" labelLine={false} label={renderLabel}>
            {data.map((entry) => (
              <PieCell key={entry.type} fill={SERVICE_COLORS[entry.type] ?? '#1E3A8A'} />
            ))}
          </Pie>
          <PieTooltip
            contentStyle={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
            itemStyle={{ color: '#fff' }}
          />
          <PieLegend
            formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 11 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Growth Trend Chart ───────────────────────────────────────────────────────

import {
  LineChart, Line, ReferenceLine
} from 'recharts'

export function GrowthTrendChart({ records }: Props) {
  const sorted = [...records].sort((a, b) => a.service_date.localeCompare(b.service_date))

  const data = sorted.map((r, i) => {
    if (i === 0) return { date: r.service_date.slice(5), growth: 0 }
    const prev   = sorted[i - 1].total_count
    const growth = prev > 0 ? Math.round(((r.total_count - prev) / prev) * 100) : 0
    return { date: r.service_date.slice(5), growth }
  }).filter((_, i) => i > 0)

  const CustomGrowthTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const val = payload[0]?.value
    return (
      <div className="bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className={`font-bold text-sm ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {val >= 0 ? '+' : ''}{val}% growth
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
      <div className="mb-5">
        <p className="text-sm font-bold text-white">Growth Trend</p>
        <p className="text-xs text-gray-500 mt-0.5">Week-over-week attendance change</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0F2035" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Tooltip content={<CustomGrowthTooltip />} />
          <Line type="monotone" dataKey="growth" strokeWidth={2}
            stroke="#F5C518" dot={{ r: 3, fill: '#F5C518', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
