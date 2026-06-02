'use client'
// src/app/portal/dashboard/page.tsx
// Member portal dashboard - matches SWGGA UI Design v3 mockup

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Flame, Play, CalendarDays, Users,
  Heart, MessageSquare, HandIcon, Bell,
  ChevronRight, BookOpen, CheckCircle2,
  Clock, Loader2,
} from 'lucide-react'
import { usePortalUser } from '../layout'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  type:    'sermon' | 'event' | 'streak' | 'announcement' | 'cell'
  title:   string
  detail:  string
  time:    string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
    timeZone: 'Africa/Lagos',
  })
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  value, label, sub, accent, icon: Icon,
}: {
  value:  string | number
  label:  string
  sub:    string
  accent: string
  icon:   React.ElementType
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]"
           style={{ background: accent }} />
      <div className="text-[26px] font-bold text-[#0D1B2A] mb-1 leading-none"
           style={{ fontFamily: 'Playfair Display, serif' }}>
        {value}
      </div>
      <div className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-1">
        <Icon size={11} />
        {sub}
      </div>
    </div>
  )
}

// ─── Activity Icon ────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const configs = {
    sermon:       { bg: 'bg-[#EBF0FA]', color: 'text-[#1E3A8A]', icon: Play         },
    event:        { bg: 'bg-[#DCFCE7]', color: 'text-[#166534]', icon: CheckCircle2  },
    streak:       { bg: 'bg-[#FDF6E3]', color: 'text-[#B8860B]', icon: Flame         },
    announcement: { bg: 'bg-[#EBF0FA]', color: 'text-[#1E3A8A]', icon: Bell          },
    cell:         { bg: 'bg-[#EDE9FE]', color: 'text-[#7C3AED]', icon: Users         },
  }
  const { bg, color, icon: Icon } = configs[type]
  return (
    <div className={`w-9 h-9 rounded-full ${bg} ${color}
                     flex items-center justify-center flex-shrink-0`}>
      <Icon size={16} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortalDashboard() {
  const { user, loading } = usePortalUser()
  const [upcomingEvents,  setUpcomingEvents]  = useState<any[]>([])
  const [recentSermons,   setRecentSermons]   = useState<any[]>([])
  const [eventsLoading,   setEventsLoading]   = useState(true)
  const [sermonsLoading,  setSermonsLoading]  = useState(true)

  useEffect(() => {
    // Fetch upcoming events
    fetch('/api/v1/events?filter=upcoming&limit=3')
      .then(r => r.json())
      .then(d => setUpcomingEvents(d.events ?? []))
      .catch(() => {})
      .finally(() => setEventsLoading(false))

    // Fetch recent sermons
    fetch('/api/v1/sermons?limit=3')
      .then(r => r.json())
      .then(d => setRecentSermons(d.sermons ?? []))
      .catch(() => {})
      .finally(() => setSermonsLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
      </div>
    )
  }

  const firstName    = user?.first_name ?? user?.name?.split(' ')[0] ?? 'Member'
  const wordStreak   = user?.word_streak ?? 0
  const ministryName = user?.ministry?.name ?? 'General'

  // Mock activity feed - will be replaced with real data in later weeks
  const activity: ActivityItem[] = [
    {
      type:   'sermon',
      title:  'New Sermon Available',
      detail: 'Uncommon Grace for Uncommon Path · May 2026',
      time:   '2 days ago',
    },
    {
      type:   'streak',
      title:  `Word Streak - ${wordStreak} Days!`,
      detail: wordStreak > 0
        ? `You have engaged with the daily Word for ${wordStreak} consecutive days. Keep going!`
        : 'Start your Word streak today by reading the daily devotional.',
      time:   'Today',
    },
    {
      type:   'announcement',
      title:  'Church Announcement',
      detail: 'Join us for our next Sunday service - Glory and His Secret Place',
      time:   '3 days ago',
    },
    {
      type:   'cell',
      title:  'Cell Group This Week',
      detail: `${ministryName} - Don't forget your Bible`,
      time:   '1 week ago',
    },
  ]

  return (
    <div className="p-6 sm:p-8 max-w-5xl">

      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-[26px] font-bold text-[#0D1B2A]"
            style={{ fontFamily: 'Playfair Display, serif' }}>
          {getGreeting()}, {firstName}
        </h2>
        <p className="text-[13px] text-[#6B7280] mt-0.5">
          {getDateString()} · Welcome back to Sure Word Glorious Gospel Assembly
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          value={wordStreak}
          label="Word Streak"
          sub="Days in the Word"
          accent="linear-gradient(135deg, #B8860B, #92650A)"
          icon={Flame}
        />
        <StatCard
          value={24}
          label="Sermons Watched"
          sub="+6 this month"
          accent="#1E3A8A"
          icon={Play}
        />
        <StatCard
          value={5}
          label="Events Attended"
          sub="2 upcoming"
          accent="#166534"
          icon={CalendarDays}
        />
        <StatCard
          value={ministryName.split(' ')[0]}
          label="Ministry"
          sub={ministryName}
          accent="#7C3AED"
          icon={Users}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        <Link href="/portal/giving"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white
                         text-sm font-bold bg-gradient-to-br from-[#B8860B] to-[#92650A]
                         hover:opacity-90 transition-opacity shadow-sm">
          <Heart size={15} /> Give Now
        </Link>
        <Link href="/portal/sermons"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white
                         text-sm font-bold bg-gradient-to-br from-[#1E3A8A] to-[#0F2460]
                         hover:opacity-90 transition-opacity">
          <Play size={15} /> Watch Sermon
        </Link>
        <Link href="/portal/prayer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white
                         text-sm font-bold bg-gradient-to-br from-[#374151] to-[#1F2937]
                         hover:opacity-90 transition-opacity">
          <HandIcon size={15} /> Prayer Request
        </Link>
        <Link href="/portal/events"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white
                         text-sm font-bold bg-gradient-to-br from-[#166534] to-[#0F4D27]
                         hover:opacity-90 transition-opacity">
          <CalendarDays size={15} /> My Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Activity */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4
                          border-b border-[#F9FAFB]">
            <h4 className="text-[15px] font-bold text-[#0D1B2A]">Recent Activity</h4>
            <span className="text-[12px] text-[#1E3A8A] font-semibold cursor-pointer
                             hover:underline">
              View all
            </span>
          </div>
          {activity.map((item, i) => (
            <div key={i}
                 className="flex gap-3.5 px-5 py-3.5 border-b border-[#F9FAFB]
                            hover:bg-[#F9FAFB] transition-colors last:border-0">
              <ActivityIcon type={item.type} />
              <div className="flex-1 min-w-0">
                <h5 className="text-[13px] font-bold text-[#0D1B2A] mb-0.5">
                  {item.title}
                </h5>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {item.detail}
                </p>
              </div>
              <span className="text-[10px] text-[#9CA3AF] flex-shrink-0 mt-0.5">
                {item.time}
              </span>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4
                          border-b border-[#F9FAFB]">
            <h4 className="text-[15px] font-bold text-[#0D1B2A]">Upcoming Events</h4>
            <Link href="/portal/events"
                  className="text-[12px] text-[#1E3A8A] font-semibold hover:underline">
              View all
            </Link>
          </div>
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#6B7280]" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CalendarDays size={24} className="text-[#D1D5DB] mx-auto mb-2" />
              <p className="text-[#6B7280] text-sm">No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map((event: any) => {
              const d = new Date(event.start_time)
              return (
                <div key={event.id}
                     className="flex gap-4 px-5 py-4 border-b border-[#F9FAFB]
                                hover:bg-[#F9FAFB] transition-colors last:border-0
                                cursor-pointer">
                  <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0F2460]
                                  rounded-xl px-3 py-3 text-center min-w-[52px]
                                  flex-shrink-0">
                    <div className="text-[#F5C518] font-bold text-xl leading-none"
                         style={{ fontFamily: 'Playfair Display, serif' }}>
                      {d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'Africa/Lagos' })}
                    </div>
                    <div className="text-white/70 text-[9px] font-bold tracking-wider
                                    uppercase mt-0.5">
                      {d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Africa/Lagos' })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-[#0D1B2A] mb-1 truncate">
                      {event.title}
                    </h4>
                    <p className="text-[12px] text-[#6B7280] leading-relaxed line-clamp-2">
                      {event.description ?? event.location ?? ''}
                    </p>
                    {event.ministry?.name && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold
                                       px-2 py-0.5 rounded bg-[#FDF6E3] text-[#92650A]">
                        {event.ministry.name}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Recent Sermons */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden
                        lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4
                          border-b border-[#F9FAFB]">
            <h4 className="text-[15px] font-bold text-[#0D1B2A]">Recent Sermons</h4>
            <Link href="/portal/sermons"
                  className="text-[12px] text-[#1E3A8A] font-semibold hover:underline">
              View all
            </Link>
          </div>
          {sermonsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#6B7280]" />
            </div>
          ) : recentSermons.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <BookOpen size={24} className="text-[#D1D5DB] mx-auto mb-2" />
              <p className="text-[#6B7280] text-sm">No sermons available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-[#F9FAFB]">
              {recentSermons.map((sermon: any) => (
                <div key={sermon.id}
                     className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors
                                cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br
                                    from-[#B8860B] to-[#92650A] flex items-center
                                    justify-center flex-shrink-0">
                      <Play size={12} className="text-white ml-0.5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                                      ${sermon.content_type === 'video_facebook'
                                        ? 'bg-[#EBF0FA] text-[#1E3A8A]'
                                        : 'bg-[#FDF6E3] text-[#92650A]'
                                      }`}>
                      {sermon.content_type === 'video_facebook' ? 'Facebook' : 'Video'}
                    </span>
                  </div>
                  <h5 className="text-[13px] font-bold text-[#0D1B2A] mb-1 line-clamp-2">
                    {sermon.title}
                  </h5>
                  <p className="text-[11px] text-[#6B7280]">
                    {sermon.speaker} · {sermon.series ?? ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
