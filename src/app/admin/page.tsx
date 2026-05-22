'use client'
// src/app/admin/page.tsx
// Admin Dashboard — Task 2
// Live metrics from Supabase (Redis-cached), Recharts charts, quick actions

import { useEffect, useState } from 'react'
import {
  Users, DollarSign, BookOpen, Calendar,
  CalendarCheck, TrendingUp, RefreshCw,
  Plus, UserPlus, Mic, Megaphone, Video,
  ArrowRight, Flame, CheckCircle2, Circle
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import { format } from 'date-fns'

// ── Types ──────────────────────────────────────────────────────────────────
interface Metrics {
  totalMembers:    number
  givingThisMonth: number
  pendingPrayers:  number
  upcomingEvents:  number
  attendanceMonth: number
  lastUpdated:     string
}

interface ChartPoint {
  date:       string
  attendance: number
  giving:     number
}

// ── Metric card ────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, icon: Icon, accent, href, loading
}: {
  label:   string
  value:   string | number
  sub:     string
  icon:    React.ElementType
  accent:  { bg: string; text: string; glow: string }
  href:    string
  loading: boolean
}) {
  return (
    <Link href={href}
      className="group relative bg-[#0A1628] border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-[#0F1E35] transition-all duration-300 overflow-hidden"
    >
      {/* Glow blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity ${accent.glow}`} />

      <div className="relative">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent.bg}`}>
          <Icon size={18} className={accent.text} />
        </div>
        {loading ? (
          <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
        )}
        <p className="text-[#64748B] text-xs font-medium">{label}</p>
        <p className="text-[#334155] text-xs mt-0.5">{sub}</p>
      </div>
    </Link>
  )
}

// ── Custom chart tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
      <p className="text-[#64748B] text-xs mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-white text-sm font-semibold">
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

// ── Quick actions ──────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Add Member',      href: '/admin/members/new',       icon: UserPlus,  color: 'bg-[#1E3A8A] hover:bg-[#0F2460]' },
  { label: 'Record Giving',   href: '/admin/giving/new',        icon: DollarSign,color: 'bg-[#B8860B] hover:bg-[#92650A]' },
  { label: 'Mark Attendance', href: '/admin/attendance/new',    icon: CalendarCheck, color: 'bg-[#166534] hover:bg-[#0D3320]' },
  { label: 'New Event',       href: '/admin/events/new',        icon: Calendar,  color: 'bg-[#6B21A8] hover:bg-[#4C1D95]' },
  { label: 'Announce',        href: '/admin/announcements/new', icon: Megaphone, color: 'bg-[#0F2460] hover:bg-[#0A1628]' },
  { label: 'Conference',      href: '/admin/conference/new',    icon: Video,     color: 'bg-[#374151] hover:bg-[#1F2937]' },
]

// ── Setup checklist ────────────────────────────────────────────────────────
const CHECKLIST = [
  { done: true,  label: 'Database schema — 21 tables with RLS' },
  { done: true,  label: 'Sanity CMS — 6 content types live' },
  { done: true,  label: 'SMS notifications — Twilio configured' },
  { done: true,  label: 'Email notifications — SendGrid configured' },
  { done: true,  label: 'Cloudinary — profile photo upload ready' },
  { done: true,  label: 'Pastor Chii Daily pipeline live' },
  { done: true,  label: 'RSS podcast feed at /api/podcast' },
  { done: false, label: 'Add first church members' },
  { done: false, label: 'Record first giving transactions' },
  { done: false, label: 'Member portal — Week 6' },
]

// ── Main dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user }                    = useAdminUser()
  const [metrics,  setMetrics]      = useState<Metrics | null>(null)
  const [charts,   setCharts]       = useState<ChartPoint[]>([])
  const [loading,  setLoading]      = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    try {
      const [mRes, cRes] = await Promise.all([
        fetch('/api/v1/admin/metrics'),
        fetch('/api/v1/admin/charts'),
      ])
      if (mRes.ok) setMetrics(await mRes.json())
      if (cRes.ok) {
        const d = await cRes.json()
        setCharts(d.chartData || [])
      }
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const METRIC_CARDS = [
    {
      label: 'Total Members',
      value: metrics?.totalMembers ?? '—',
      sub:   'Registered',
      icon:  Users,
      href:  '/admin/members',
      accent: { bg: 'bg-[#1E3A8A]/20', text: 'text-[#93C5FD]', glow: 'bg-blue-500' },
    },
    {
      label: 'Giving This Month',
      value: metrics ? `₦${metrics.givingThisMonth.toLocaleString()}` : '—',
      sub:   format(new Date(), 'MMMM yyyy'),
      icon:  DollarSign,
      href:  '/admin/giving',
      accent: { bg: 'bg-[#B8860B]/20', text: 'text-[#F5C518]', glow: 'bg-yellow-500' },
    },
    {
      label: 'Prayer Requests',
      value: metrics?.pendingPrayers ?? '—',
      sub:   'Awaiting response',
      icon:  BookOpen,
      href:  '/admin/prayer',
      accent: { bg: 'bg-[#166534]/20', text: 'text-[#86EFAC]', glow: 'bg-green-500' },
    },
    {
      label: 'Upcoming Events',
      value: metrics?.upcomingEvents ?? '—',
      sub:   'Scheduled',
      icon:  Calendar,
      href:  '/admin/events',
      accent: { bg: 'bg-[#6B21A8]/20', text: 'text-[#D8B4FE]', glow: 'bg-purple-500' },
    },
    {
      label: 'Attendance',
      value: metrics?.attendanceMonth ?? '—',
      sub:   'This month',
      icon:  CalendarCheck,
      href:  '/admin/attendance',
      accent: { bg: 'bg-[#0F2460]/30', text: 'text-[#93C5FD]', glow: 'bg-blue-600' },
    },
    {
      label: 'Word Streak',
      value: '—',
      sub:   'Active today',
      icon:  Flame,
      href:  '/admin/members',
      accent: { bg: 'bg-[#B8860B]/20', text: 'text-[#F5C518]', glow: 'bg-orange-500' },
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#64748B] text-sm mb-1">{greeting()}, {user?.name?.split(' ')[0] || 'Admin'}</p>
          <h1 className="text-white font-bold text-2xl leading-tight">Admin Dashboard</h1>
          <p className="text-[#334155] text-xs mt-1">
            Sure Word Glorious Gospel Assembly · Warri, Delta State
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-[#0A1628] border border-white/5 rounded-xl text-[#64748B] hover:text-white hover:border-white/10 text-xs font-medium transition-all"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Metrics grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRIC_CARDS.map(card => (
          <MetricCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Attendance chart */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white font-semibold text-sm">Attendance Trend</p>
              <p className="text-[#334155] text-xs mt-0.5">Last 30 days</p>
            </div>
            <TrendingUp size={16} className="text-[#334155]" />
          </div>
          {charts.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-[#334155] text-xs">No attendance data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={charts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1E3A8A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0F172A" />
                <XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false}
                  interval={6} />
                <YAxis tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={2}
                  fill="url(#attendGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Giving chart */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white font-semibold text-sm">Giving Trend</p>
              <p className="text-[#334155] text-xs mt-0.5">Last 30 days (₦)</p>
            </div>
            <DollarSign size={16} className="text-[#334155]" />
          </div>
          {charts.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-[#334155] text-xs">No giving data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={charts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0F172A" />
                <XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false}
                  interval={6} />
                <YAxis tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip prefix="₦" />} />
                <Bar dataKey="giving" fill="#B8860B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Quick actions + checklist ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Quick actions */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold text-sm mb-4">Quick Actions</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.href}
                  className={`${action.color} rounded-xl p-3 flex flex-col items-center gap-2 transition-colors group`}
                >
                  <Icon size={18} className="text-white" />
                  <span className="text-white text-xs font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Setup checklist */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold text-sm">Platform Setup</p>
            <span className="text-[#64748B] text-xs">
              {CHECKLIST.filter(c => c.done).length}/{CHECKLIST.length} complete
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(CHECKLIST.filter(c => c.done).length / CHECKLIST.length) * 100}%`,
                background: 'linear-gradient(90deg, #1E3A8A, #B8860B)',
              }}
            />
          </div>
          <div className="space-y-2">
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {item.done
                  ? <CheckCircle2 size={14} className="text-[#86EFAC] flex-shrink-0" />
                  : <Circle      size={14} className="text-[#334155] flex-shrink-0" />
                }
                <span className={`text-xs ${item.done ? 'text-[#64748B]' : 'text-[#334155]'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Last updated ───────────────────────────────────────────────── */}
      {metrics?.lastUpdated && (
        <p className="text-[#1E293B] text-xs text-right">
          Metrics cached · last updated {format(new Date(metrics.lastUpdated), 'HH:mm:ss')}
        </p>
      )}

    </div>
  )
}
