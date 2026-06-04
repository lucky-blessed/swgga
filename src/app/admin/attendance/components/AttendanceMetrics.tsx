'use client'
// src/app/admin/attendance/components/AttendanceMetrics.tsx

import { TrendingUp, TrendingDown, Users, Star, BarChart2, Calendar } from 'lucide-react'
import type { ServiceRecord } from '@/hooks/admin/useAttendance'

interface Props {
  records:     ServiceRecord[]
  allRecords:  ServiceRecord[] // for growth comparison
  fromDate?:   string
  toDate?:     string
}

function getMonthRecords(records: ServiceRecord[], monthsAgo: number) {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const end   = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0)
  return records.filter(r => {
    const d = new Date(r.service_date)
    return d >= start && d <= end
  })
}

function getPreviousPeriodRecords(allRecords: ServiceRecord[], fromDate?: string, toDate?: string) {
  if (!fromDate || !toDate) return []
  const from = new Date(fromDate)
  const to   = new Date(toDate)
  const diff = to.getTime() - from.getTime()
  const prevTo   = new Date(from.getTime() - 1)
  const prevFrom = new Date(prevTo.getTime() - diff)
  return allRecords.filter(r => {
    const d = new Date(r.service_date)
    return d >= prevFrom && d <= prevTo
  })
}

function MetricCard({
  label, value, sub, icon: Icon, growth, gold = false
}: {
  label: string; value: string | number; sub?: string
  icon: any; growth?: number; gold?: boolean
}) {
  const iconColor = gold ? 'text-[#F5C518]' : 'text-blue-400'
  const iconBg    = gold ? 'bg-[#B8860B]/10 border-[#B8860B]/20' : 'bg-[#1E3A8A]/10 border-[#1E3A8A]/20'

  return (
    <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl ${iconBg} border flex items-center justify-center`}>
          <Icon size={16} className={iconColor} />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold
            ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growth >= 0
              ? <TrendingUp size={13} />
              : <TrendingDown size={13} />
            }
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AttendanceMetrics({ records, allRecords, fromDate, toDate }: Props) {
  // Compare current period vs previous period of same length
  const prevPeriod     = getPreviousPeriodRecords(allRecords, fromDate, toDate)
  const thisMonthTotal = records.reduce((s, r) => s + r.total_count, 0)
  const lastMonthTotal = prevPeriod.reduce((s, r) => s + r.total_count, 0)
  const monthGrowth    = lastMonthTotal > 0
    ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    : 0
  const thisMonth = records
  const lastMonth = prevPeriod

  // Averages
  const avg = records.length
    ? Math.round(records.reduce((s, r) => s + r.total_count, 0) / records.length)
    : 0

  // Highest
  const highest = records.length
    ? Math.max(...records.map(r => r.total_count))
    : 0

  const highestRecord = records.find(r => r.total_count === highest)

  // First timers
  const firstTimers = records.reduce((s, r) => s + (r.first_timers ?? 0), 0)
  const lastMonthFT = lastMonth.reduce((s, r) => s + (r.first_timers ?? 0), 0)
  const thisFT      = thisMonth.reduce((s, r) => s + (r.first_timers ?? 0), 0)
  const ftGrowth    = lastMonthFT > 0
    ? Math.round(((thisFT - lastMonthFT) / lastMonthFT) * 100)
    : 0

  // Services this period
  const serviceCount = records.length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        label="Period Total"
        value={thisMonthTotal.toLocaleString()}
        icon={Users}
        growth={monthGrowth}
        sub={`${thisMonth.length} services`}
      />
      <MetricCard
        label="Average per Service"
        value={avg.toLocaleString()}
        icon={BarChart2}
        sub={`Over ${serviceCount} services`}
      />
      <MetricCard
        label="Highest Attendance"
        value={highest.toLocaleString()}
        icon={TrendingUp}
        sub={highestRecord?.service_date ?? ''}
      />
      <MetricCard
        label="Total First Timers"
        value={firstTimers.toLocaleString()}
        icon={Star}
        growth={ftGrowth}
        gold
        sub="In selected period"
      />
      <MetricCard
        label="Services Recorded"
        value={serviceCount}
        icon={Calendar}
        sub="In selected period"
      />
    </div>
  )
}
