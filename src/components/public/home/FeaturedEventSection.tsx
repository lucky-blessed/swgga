'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Clock, X, ChevronLeft, ChevronRight, Users } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Speaker    { name: string; role: string }
interface EventPhoto { url: string; lqip: string  }

interface FeaturedEvent {
  _id:                 string
  title:               string
  theme:               string | null
  date:                string
  endDate:             string | null
  sessionTimes:        string | null
  location:            string | null
  registrationEnabled: boolean
  speakers:            Speaker[] | null
  flyer:               { url: string; lqip: string } | null
  eventPhotos:         EventPhoto[] | null
}



// ─── Photo Strip ─────────────────────────────────────────────────────────────
function PhotoStrip({ photos }: { photos: EventPhoto[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const PHOTOS = photos

  function prev() {
    setLightboxIndex(i => i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length)
  }
  function next() {
    setLightboxIndex(i => i === null ? null : (i + 1) % PHOTOS.length)
  }

  return (
    <>
      <div className="bg-[#040C18] pt-6 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/5" />
            <p className="text-[#F5C518]/50 text-xs font-semibold tracking-widest uppercase">
              Event Moments
            </p>
            <div className="h-px flex-1 bg-white/5" />
          </div>
        </div>

        {PHOTOS.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02]
                            flex items-center justify-center py-10 gap-3">
              <Users size={16} className="text-white/20" />
              <p className="text-white/20 text-xs tracking-widest uppercase">
                Event photos will appear here soon
              </p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden" style={{ height: '180px' }}>
            <div
              className="flex gap-3 absolute top-0 left-0"
              style={{ animation: 'photoScroll 35s linear infinite', width: 'max-content' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.animationPlayState = 'paused')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.animationPlayState = 'running')}
            >
              {[...PHOTOS, ...PHOTOS].map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i % PHOTOS.length)}
                  className="flex-shrink-0 relative rounded-xl overflow-hidden
                             hover:scale-105 transition-transform duration-300 focus:outline-none"
                  style={{ width: '280px', height: '180px' }}
                >
                  <Image src={src.url} alt={`Event photo ${(i % PHOTOS.length) + 1}`}
                    fill className="object-cover" sizes="280px" />
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/0
                                  transition-colors duration-300" />
                </button>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none
                            bg-gradient-to-r from-[#040C18] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none
                            bg-gradient-to-l from-[#040C18] to-transparent z-10" />
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && PHOTOS.length > 0 && (
          <>
            <motion.div key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 bg-black/92 z-50 backdrop-blur-sm" />
            <motion.div key="lightbox"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="relative w-full max-w-4xl pointer-events-auto rounded-2xl overflow-hidden">
                <Image src={PHOTOS[lightboxIndex].url} alt={`Event photo ${lightboxIndex + 1}`}
                  width={1200} height={800} className="object-contain w-full max-h-[85vh]" />
                <button onClick={() => setLightboxIndex(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60
                             flex items-center justify-center text-white hover:bg-[#B8860B] transition-colors">
                  <X size={16} />
                </button>
                {PHOTOS.length > 1 && (
                  <>
                    <button onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                                 bg-black/60 flex items-center justify-center text-white
                                 hover:bg-[#B8860B] transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                                 bg-black/60 flex items-center justify-center text-white
                                 hover:bg-[#B8860B] transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1
                                bg-black/60 rounded-full text-white text-xs">
                  {lightboxIndex + 1} / {PHOTOS.length}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function FeaturedEventSection({ event }: { event: FeaturedEvent | null }) {
  if (!event) return null

  const startDate = new Date(event.date)
  const endDate   = event.endDate ? new Date(event.endDate) : null
  const now       = new Date()
  const isLive    = now >= startDate && (!endDate || now <= endDate)

  const dateLabel = endDate
    ? `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const photos = event.eventPhotos ?? []
  const flyerSrc = event.flyer?.url ?? '/images/camp-meeting-2026.jpg'
  return (
    <>
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.0) translate(0px, 0px); }
          33%  { transform: scale(1.05) translate(-6px, -4px); }
          66%  { transform: scale(1.04) translate(4px, -2px); }
          100% { transform: scale(1.0) translate(0px, 0px); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
        }
        @keyframes photoScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmerLine {
          0%   { transform: translateX(-100%); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      <section className="relative w-full overflow-hidden" style={{ minHeight: '95vh' }}>

        {/* ── Flyer background ── */}
        <div className="absolute inset-0 bg-[#040C18]">
          <div
            className="absolute inset-0"
            style={{
              animation: 'kenBurns 22s ease-in-out infinite',
              transformOrigin: 'center center',
            }}
          >
            <Image
              src={flyerSrc}
              alt={event.title}
              fill
              className="object-cover"
              style={{ objectPosition: 'center center' }}
              sizes="100vw"
              priority
            />
          </div>
        </div>

        {/* ── Layered overlays ── */}
        {/* Top seamless blend from hero */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-10"
             style={{ background: 'linear-gradient(to bottom, #040D1A 0%, rgba(4,13,26,0.6) 50%, transparent 100%)' }} />

        {/* Bottom-heavy gradient — keeps text readable */}
        <div className="absolute inset-0 z-10"
             style={{ background: 'linear-gradient(to top, rgba(4,12,24,0.97) 0%, rgba(4,12,24,0.85) 25%, rgba(4,12,24,0.4) 55%, rgba(4,12,24,0.1) 100%)' }} />

        {/* Left vignette */}
        <div className="absolute inset-0 z-10"
             style={{ background: 'linear-gradient(to right, rgba(4,12,24,0.7) 0%, transparent 50%)' }} />

        {/* ── Content ── */}
        <div className="relative z-20 flex flex-col justify-end min-h-[95vh] pb-14 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

            {/* Badge */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="mb-5">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                           text-xs font-bold tracking-[0.2em] uppercase border"
                style={{
                  animation:   'badgePulse 2.5s ease-in-out infinite',
                  background:  'rgba(239,68,68,0.15)',
                  borderColor: 'rgba(239,68,68,0.45)',
                  color:       '#FCA5A5',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {isLive ? 'Now Happening' : 'Coming Soon'}
              </span>
            </motion.div>

            {/* Label */}
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-[#F5C518] text-xs font-bold tracking-[0.35em] uppercase mb-3">
              {event.title}
            </motion.p>

            {/* Details row */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
              {[
                { icon: <Calendar size={13} />, text: dateLabel },
                ...(event.sessionTimes ? [{ icon: <Clock size={13} />, text: event.sessionTimes.replace(/"$/, '') }] : []),
                ...(event.location ? [{ icon: <MapPin size={13} />, text: event.location }] : []),
              ].map(({ icon, text }) => (
                <div key={text}
                  className="flex items-center gap-2 text-white/75 text-sm
                             backdrop-blur-sm">
                  <span className="text-[#F5C518]">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>

            {/* Speakers */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.37, ease: [0.22, 1, 0.36, 1] }} className="flex flex-wrap gap-2 mb-9">
              {(event.speakers ?? []).map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                  className="px-3.5 py-2 rounded-xl border"
                  style={{
                    background:   'rgba(255,255,255,0.08)',
                    borderColor:  'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <p className="text-white text-xs font-semibold leading-tight">
                    {s.name}
                  </p>
                  <p className="text-[#F5C518]/60 text-[11px] mt-0.5">{s.role}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center
                           px-9 py-4 rounded-xl font-bold text-sm
                           text-[#0D1B2A] transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #B8860B 0%, #F5C518 50%, #B8860B 100%)',
                  backgroundSize: '200% 100%',
                  boxShadow: '0 0 40px rgba(184,134,11,0.45), 0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                Register Now
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center
                           px-9 py-4 rounded-xl font-semibold text-sm
                           text-white transition-all duration-300"
                style={{
                  background:   'rgba(255,255,255,0.06)',
                  border:       '1px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(245,197,24,0.6)'
                  e.currentTarget.style.color = '#F5C518'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.color = 'white'
                }}
              >
                View Full Details
              </Link>
            </motion.div>

          </div>
        </div>

        {/* Bottom blend */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, transparent, #040C18)' }} />
      </section>

      <PhotoStrip photos={photos} />
    </>
  )
}
