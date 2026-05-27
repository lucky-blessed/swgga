'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, MapPin, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const filterChips = ['All Events', 'Services', 'Ministries', 'CTY', 'Special Events']

const TAG_COLORS: Record<string, string> = {
  'Service':           'bg-[#EBF0FA] text-[#1E3A8A]',
  'Youth Ministry':    'bg-[#EBF0FA] text-[#1E3A8A]',
  'Healing Streams':   'bg-[#FDF6E3] text-[#92650A]',
  'CTY':               'bg-[#DCFCE7] text-[#166534]',
  'Special Events':    'bg-[#F3E8FF] text-[#6B21A8]',
  'Impact Fellowship': 'bg-[#FDF6E3] text-[#B8860B]',
  'General':           'bg-[#F1F5F9] text-[#475569]',
}

const BTN_STYLE: Record<string, string> = {
  'Service':           'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
  'Youth Ministry':    'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
  'Healing Streams':   'bg-[#B8860B] text-white hover:bg-[#92650A]',
  'CTY':               'bg-[#166534] text-white hover:bg-[#0D3320]',
  'Special Events':    'bg-[#6B21A8] text-white hover:bg-[#4C1672]',
  'Impact Fellowship': 'bg-[#B8860B] text-white hover:bg-[#92650A]',
  'General':           'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
}

function inferMinistry(e: any): string {
  if (e.ministry) return e.ministry
  const title = (e.title ?? '').toLowerCase()
  if (title.includes('youth') || title.includes('cty')) return 'CTY'
  if (title.includes('healing')) return 'Healing Streams'
  if (title.includes('service') || title.includes('sunday')) return 'Service'
  return 'General'
}

function normaliseEvent(e: any) {
  return {
    _id:                 e.id,
    title:               e.title,
    date:                e.start_time,
    endDate:             e.end_time,
    description:         e.description,
    location:            e.location,
    imageUrl:            e.image_url,
    ministry:            inferMinistry(e),
    registrationEnabled: e.registration_enabled,
    membersOnly:         e.members_only,
    isCty:               e.is_cty_event,
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday:  'long',
    day:      'numeric',
    month:    'long',
    year:     'numeric',
    timeZone: 'Africa/Lagos',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'Africa/Lagos',
    hour12:   false,
  }) + ' WAT'
}

function buildWhatsApp(event: any): string {
  const date = formatDate(event.date)
  const time = formatTime(event.date)
  const loc  = event.location ?? 'Sure Word GGA, Warri'
  const msg  = `Join us for *${event.title}* at Sure Word GGA!\n\nDate: ${date}\nTime: ${time}\nLocation: ${loc}\n\nswgga.vercel.app/events`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

function getCountdown(dateStr: string): string | null {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return null
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 30) return null
  if (days > 0)  return `In ${days}d ${hours}h`
  return `In ${hours}h`
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function EventModal({ event, onClose }: { event: any; onClose: () => void }) {
  const tagColor = TAG_COLORS[event.ministry?.name ?? ""] ?? 'bg-[#EBF0FA] text-[#1E3A8A]'
  const btnStyle = BTN_STYLE[event.ministry?.name ?? ""]  ?? 'bg-[#1E3A8A] text-white'

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
      >
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full object-contain bg-gray-50"
            style={{ maxHeight: '55vh' }}
          />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagColor}`}>
                {event.ministry?.name}
              </span>
              {event.membersOnly && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FDF6E3] text-[#B8860B]">
                  Members Only
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#1A1A1A] mb-5 leading-snug">
            {event.title}
          </h2>
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-3 text-[#374151] text-sm">
              <div className="w-8 h-8 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={14} className="text-[#B8860B]" />
              </div>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-[#374151] text-sm">
              <div className="w-8 h-8 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={14} className="text-[#B8860B]" />
              </div>
              <span>{formatTime(event.date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3 text-[#374151] text-sm">
                <div className="w-8 h-8 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-[#B8860B]" />
                </div>
                <span>{event.location}</span>
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-[#374151] text-sm leading-relaxed whitespace-pre-line mb-6 border-t border-gray-100 pt-4">
              {event.description}
            </p>
          )}
          <div className="flex gap-3">
            <a
              href={buildWhatsApp(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#DCFCE7] text-[#166534] text-sm font-bold hover:bg-[#BBF7D0] transition-colors flex-shrink-0"
            >
              <WaIcon />
              Share
            </a>
            <button
              className={`flex-1 text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95 ${btnStyle}`}
            >
              {event.registrationEnabled ? 'Register Now' : 'Add to Calendar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EventCard({ event, index, onViewDetails }: { event: any; index: number; onViewDetails: (e: any) => void }) {
  const tagColor  = TAG_COLORS[event.ministry?.name ?? ""] ?? 'bg-[#EBF0FA] text-[#1E3A8A]'
  const btnStyle  = BTN_STYLE[event.ministry?.name ?? ""]  ?? 'bg-[#1E3A8A] text-white'
  const countdown = getCountdown(event.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group"
    >
      <div className="flex flex-col sm:flex-row">

        {/* Flyer — left side */}
        <div
          className="sm:w-2/5 flex-shrink-0 cursor-pointer relative overflow-hidden"
          onClick={() => onViewDetails(event)}
        >
          {event.imageUrl ? (
            <div className="relative w-full" style={{ paddingBottom: '133%' }}>
              <img
                src={event.imageUrl}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              {countdown && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  {countdown}
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-full flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] to-[#1E3A8A]"
              style={{ paddingBottom: '60%' }}
            >
              <span className="absolute text-white/10 text-8xl font-bold select-none">✝</span>
            </div>
          )}
        </div>

        {/* Details — right side */}
        <div className="flex-1 flex flex-col p-6 sm:p-8">

          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${tagColor}`}>
                {event.ministry?.name}
              </span>
              {event.membersOnly && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FDF6E3] text-[#B8860B]">
                  Members Only
                </span>
              )}
            </div>
            {!event.imageUrl && countdown && (
              <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full flex-shrink-0">
                {countdown}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-snug mb-3 cursor-pointer hover:text-[#1E3A8A] transition-colors duration-200"
            onClick={() => onViewDetails(event)}
          >
            {event.title}
          </h3>

          {/* Gold divider */}
          <div className="w-10 h-0.5 bg-[#B8860B] rounded-full mb-4" />

          {/* Meta */}
          <div className="flex flex-col gap-2.5 mb-4">
            <div className="flex items-center gap-3 text-[#374151] text-sm">
              <div className="w-7 h-7 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={13} className="text-[#B8860B]" />
              </div>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-[#374151] text-sm">
              <div className="w-7 h-7 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={13} className="text-[#B8860B]" />
              </div>
              <span>{formatTime(event.date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3 text-[#374151] text-sm">
                <div className="w-7 h-7 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={13} className="text-[#B8860B]" />
                </div>
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 whitespace-pre-line mb-5 flex-1">
              {event.description}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-auto flex gap-3">
            <a
              href={buildWhatsApp(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#DCFCE7] text-[#166534] text-sm font-bold hover:bg-[#BBF7D0] transition-colors duration-200 flex-shrink-0"
              title="Share on WhatsApp"
            >
              <WaIcon />
              Share
            </a>
            <button
              onClick={() => onViewDetails(event)}
              className={`flex-1 text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95 ${btnStyle}`}
            >
              {event.registrationEnabled ? 'Register Now' : 'View Full Details'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-2/5 bg-gray-100" style={{ paddingBottom: '26%' }} />
        <div className="flex-1 p-8 space-y-4">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="w-10 h-0.5 bg-gray-100 rounded" />
          <div className="space-y-2.5">
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-2/5" />
          </div>
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="flex gap-3 pt-2">
            <div className="h-11 w-24 bg-gray-100 rounded-xl" />
            <div className="h-11 flex-1 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [events,        setEvents]        = useState<any[]>([])
  const [filtered,      setFiltered]      = useState<any[]>([])
  const [activeFilter,  setActiveFilter]  = useState('All Events')
  const [loading,       setLoading]       = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  useEffect(() => {
    fetch('/api/v1/events?limit=50&filter=upcoming')
      .then(r => r.json())
      .then((data: any) => {
        const normalised = (data.events ?? []).map(normaliseEvent)
        setEvents(normalised)
        setFiltered(normalised)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeFilter === 'All Events') { setFiltered(events); return }
    setFiltered(events.filter(e => {
      if (activeFilter === 'Services')       return e.ministry === 'Service'
      if (activeFilter === 'CTY')            return e.ministry === 'CTY' || e.isCty
      if (activeFilter === 'Ministries')     return ['Youth Ministry', 'Healing Streams', 'Impact Fellowship'].includes(e.ministry)
      if (activeFilter === 'Special Events') return e.ministry === 'Special Events'
      return true
    }))
  }, [activeFilter, events])

  return (
    <main>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Events Calendar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-blue-200 text-lg max-w-2xl mx-auto"
          >
            Services, programmes, and special events — stay connected with what is happening at Sure Word
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterChips.map(chip => (
            <motion.button
              key={chip}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(chip)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 ${
                activeFilter === chip
                  ? 'bg-[#1E3A8A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-[#EBF0FA] hover:text-[#1E3A8A]'
              }`}
            >
              {chip}
            </motion.button>
          ))}
        </div>

        {/* Event count */}
        {!loading && filtered.length > 0 && (
          <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-6">
            {filtered.length} Upcoming Event{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 text-gray-400"
          >
            <p className="text-lg font-bold mb-2">No upcoming events</p>
            <p className="text-sm">
              {events.length === 0
                ? 'No events published yet. Check back soon.'
                : 'No events match this filter.'}
            </p>
          </motion.div>
        )}

        {/* Event cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((event, i) => (
              <EventCard
                key={event._id}
                event={event}
                index={i}
                onViewDetails={setSelectedEvent}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>

    </main>
  )
}
