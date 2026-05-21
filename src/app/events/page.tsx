'use client'

import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useState, useEffect, useRef } from 'react'
import { client } from '@/sanity/lib/client'
import { upcomingEventsQuery } from '@/sanity/lib/queries'
import { ChevronLeft, ChevronRight, X, Calendar, MapPin, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const filterChips = ['All Events', 'Services', 'Ministries', 'CTY', 'Special Events']

const TAG_COLORS: Record<string, string> = {
  'Service':           'bg-[#EBF0FA] text-[#1E3A8A]',
  'Youth Ministry':    'bg-[#EBF0FA] text-[#1E3A8A]',
  'Healing Streams':   'bg-[#FDF6E3] text-[#92650A]',
  'CTY':               'bg-[#DCFCE7] text-[#166534]',
  'Special Events':    'bg-[#F3E8FF] text-[#6B21A8]',
  'Impact Fellowship': 'bg-[#FDF6E3] text-[#B8860B]',
}

const BTN_STYLE: Record<string, string> = {
  'Service':           'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
  'Youth Ministry':    'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
  'Healing Streams':   'bg-[#B8860B] text-white hover:bg-[#92650A]',
  'CTY':               'bg-[#166534] text-white hover:bg-[#0D3320]',
  'Special Events':    'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
  'Impact Fellowship': 'bg-[#1E3A8A] text-white hover:bg-[#0F2460]',
}

// ── Event Detail Modal ──────────────────────────────────────────────────────
function EventModal({ event, onClose }: { event: any; onClose: () => void }) {
  const eventDate = new Date(event.date)
  const tagColor = TAG_COLORS[event.ministry] || 'bg-[#EBF0FA] text-[#1E3A8A]'
  const btnStyle = BTN_STYLE[event.ministry] || 'bg-[#1E3A8A] text-white'

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
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
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title}
            className="w-full object-contain bg-gray-50" style={{ maxHeight: '50vh' }} />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagColor}`}>{event.ministry}</span>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <X size={15} />
            </button>
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#1A1A1A] mb-4">{event.title}</h2>
          <div className="flex flex-col gap-2 mb-5">
            <div className="flex items-center gap-2 text-[#374151] text-sm">
              <Calendar size={14} className="text-[#B8860B] flex-shrink-0" />
              <span>{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-[#374151] text-sm">
              <Clock size={14} className="text-[#B8860B] flex-shrink-0" />
              <span>{new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} WAT</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-[#374151] text-sm">
                <MapPin size={14} className="text-[#B8860B] flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-[#374151] text-sm leading-relaxed whitespace-pre-line mb-6">{event.description}</p>
          )}
          <button className={`w-full text-sm font-bold px-6 py-3 rounded-xl transition-colors duration-200 ${btnStyle}`}>
            {event.registrationEnabled ? 'Register for This Event' : 'Add to Calendar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Premium Flyer Carousel ──────────────────────────────────────────────────
// Left: poster at 3:4 aspect ratio (compact, no overflow)
// Right: clean event details with full typography hierarchy
function FlyerCarousel({ events, onViewDetails }: { events: any[]; onViewDetails: (e: any) => void }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number>(0)
  const total = events.length

  useEffect(() => {
    if (isPaused || total <= 1) return
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent(prev => (prev + 1) % total)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, total])

  function prev() { setDirection(-1); setCurrent(p => (p - 1 + total) % total) }
  function next() { setDirection(1);  setCurrent(p => (p + 1) % total) }

  function handleTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
  }

  const event = events[current]
  if (!event) return null

  const eventDate = new Date(event.date)
  const tagColor = TAG_COLORS[event.ministry] || 'bg-[#EBF0FA] text-[#1E3A8A]'
  const btnStyle = BTN_STYLE[event.ministry] || 'bg-[#1E3A8A] text-white'

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  }

  return (
    <div
      className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col sm:flex-row">

        {/* LEFT — Poster at 3:4 aspect ratio, never overflows */}
        <div className="sm:w-2/5 flex-shrink-0">
          <div className="relative w-full overflow-hidden" style={{ paddingBottom: '133%' }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
                key={event._id + '-img'}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.98, ease: [0.25, 0.46, 0.45, 0.94] }}
                src={event.imageUrl}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                onClick={() => onViewDetails(event)}
              />
            </AnimatePresence>
            {/* Subtle gradient at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* RIGHT — Event details */}
        <div className="flex-1 flex flex-col p-6 sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={event._id + '-info'}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.98, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.06 }}
              className="flex flex-col gap-4 flex-1"
            >
              {/* Tag + counter */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${tagColor}`}>{event.ministry}</span>
                <span className="text-gray-300 text-xs">{current + 1} / {total}</span>
              </div>

              {/* Title */}
              <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-snug">
                {event.title}
              </h3>

              {/* Divider */}
              <div className="w-10 h-0.5 bg-[#B8860B] rounded-full" />

              {/* Meta */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-[#374151] text-sm">
                  <div className="w-7 h-7 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={13} className="text-[#B8860B]" />
                  </div>
                  <span>{eventDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#374151] text-sm">
                  <div className="w-7 h-7 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={13} className="text-[#B8860B]" />
                  </div>
                  <span>{eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} WAT</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2.5 text-[#374151] text-sm">
                    <div className="w-7 h-7 bg-[#FDF6E3] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={13} className="text-[#B8860B]" />
                    </div>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {/* Short description */}
              {event.description && (
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 whitespace-pre-line">
                  {event.description}
                </p>
              )}

              {/* CTA */}
              <div className="mt-auto pt-2">
                <button
                  onClick={() => onViewDetails(event)}
                  className={`w-full text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95 ${btnStyle}`}
                >
                  {event.registrationEnabled ? 'Register Now' : 'View Full Details'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {total > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                    className={`rounded-full transition-all duration-300 ${
                      i === current ? 'w-5 h-2 bg-[#1E3A8A]' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={prev}
                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#1E3A8A] hover:bg-[#EBF0FA] flex items-center justify-center text-gray-400 hover:text-[#1E3A8A] transition-all duration-200">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={next}
                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#1E3A8A] hover:bg-[#EBF0FA] flex items-center justify-center text-gray-400 hover:text-[#1E3A8A] transition-all duration-200">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('All Events')
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  useEffect(() => {
    client.fetch(upcomingEventsQuery).then((data: any[]) => {
      setEvents(data || [])
      setFiltered(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeFilter === 'All Events') { setFiltered(events); return }
    setFiltered(events.filter(e => {
      if (activeFilter === 'Services')       return e.ministry === 'Service'
      if (activeFilter === 'CTY')            return e.ministry === 'CTY'
      if (activeFilter === 'Ministries')     return ['Youth Ministry', 'Healing Streams', 'Impact Fellowship'].includes(e.ministry)
      if (activeFilter === 'Special Events') return e.ministry === 'Special Events'
      return true
    }))
  }, [activeFilter, events])

  const withFlyer    = filtered.filter(e => e.imageUrl)
  const withoutFlyer = filtered.filter(e => !e.imageUrl)

  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">Events Calendar</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">Services, programmes, and special events — stay connected with what is happening at Sure Word</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* FILTER CHIPS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterChips.map(chip => (
            <motion.button key={chip} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(chip)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 ${
                activeFilter === chip ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-500 hover:bg-[#EBF0FA] hover:text-[#1E3A8A]'
              }`}
            >{chip}</motion.button>
          ))}
        </div>

        {loading ? (
          <div className="bg-gray-100 rounded-3xl overflow-hidden animate-pulse">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-2/5 bg-gray-200" style={{ paddingBottom: '53%' }} />
              <div className="flex-1 p-8 space-y-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 - i * 10}%` }} />)}
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 text-gray-400">
            <p className="text-lg font-bold mb-2">No upcoming events</p>
            <p className="text-sm">{events.length === 0 ? 'No events published yet. Check back soon.' : 'No events match this filter.'}</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* FLYER CAROUSEL */}
            {withFlyer.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-4">Featured Events</p>
                <FlyerCarousel events={withFlyer} onViewDetails={setSelectedEvent} />
              </motion.div>
            )}

            {/* NO-FLYER EVENTS */}
            {withoutFlyer.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                {withFlyer.length > 0 && <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-4">More Events</p>}
                <div className="flex flex-col gap-3">
                  {withoutFlyer.map(event => {
                    const d = new Date(event.date)
                    const tagColor = TAG_COLORS[event.ministry] || 'bg-[#EBF0FA] text-[#1E3A8A]'
                    const btnStyle = BTN_STYLE[event.ministry] || 'bg-[#1E3A8A] text-white'
                    return (
                      <motion.div key={event._id} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                        className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                          event.featured ? 'bg-gradient-to-br from-[#B8860B] to-[#92650A]' : 'bg-[#1E3A8A]'
                        }`}>
                          <span className="text-white font-bold text-lg leading-none">{d.toLocaleDateString('en-GB', { day: '2-digit' })}</span>
                          <span className="text-white/70 text-xs font-semibold uppercase">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-[family-name:var(--font-heading)] text-base font-bold text-[#1A1A1A] mb-1">{event.title}</h4>
                          {event.description && (
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 whitespace-pre-line mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagColor}`}>{event.ministry}</span>
                            <button onClick={e => { e.stopPropagation(); setSelectedEvent(event) }}
                              className={`ml-auto text-xs font-bold px-4 py-2 rounded-full transition-colors duration-200 ${btnStyle}`}>
                              View Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
