'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Heart, Calendar, Clock, MapPin,
  ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react'

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useNextSundayCountdown() {
  const [time, setTime] = useState({ d: '0', h: '00', m: '00', s: '00' })
  useEffect(() => {
    function update() {
      const now  = new Date()
      const next = new Date(now)
      const day  = now.getDay()
      next.setDate(now.getDate() + (day === 0 ? 7 : 7 - day))
      next.setHours(7, 0, 0, 0)
      const diff = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
      setTime({
        d: String(Math.floor(diff / 86400)),
        h: String(Math.floor((diff % 86400) / 3600)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600) / 60)).padStart(2, '0'),
        s: String(diff % 60).padStart(2, '0'),
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

// ─── Slide data ───────────────────────────────────────────────────────────────
// Add future event slides here as new objects in this array
const SLIDES = [
  { id: 'church', type: 'church' },
  { id: 'camp-meeting', type: 'event' },
] as const

const EVENT = {
  isLive:       true,
  badge:        'Now Happening',
  label:        'Camp Meeting 2026',
  dates:        '13 August – 16 August 2026',
  sessionTimes: 'Thursday 4:00 PM · Fri–Sat 8:00 AM & 4:00 PM',
  location:     'Okwuisoko, Sure Word Layout after MTN Mast, Effurun-Warri',
  flyer:        '/images/camp-meeting-2026.jpg',
  speakers: [
    { name: 'Rev. Chijioke Igbani', role: 'Host'           },
    { name: 'Pst. Vera Orobor',     role: 'Guest Speaker'  },
    { name: 'Pst. Teegee',          role: 'Guest Minister' },
    { name: 'Apostle Jeff',         role: 'Guest Speaker'  },
  ],
}

// ─── Slide 1: Church Hero ─────────────────────────────────────────────────────
function ChurchSlide({ visible }: { visible: boolean }) {
  const time = useNextSundayCountdown()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#040D1A]" />
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,58,138,0.7) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 50% 40% at 15% 90%, rgba(184,134,11,0.15) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 40% 40% at 85% 10%, rgba(184,134,11,0.1) 0%, transparent 60%)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 pointer-events-none"
           style={{ background: 'linear-gradient(to bottom, rgba(184,134,11,0.6), transparent)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center
                      flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">

        {/* Location pill */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10
                        text-white/60 text-xs font-semibold tracking-widest uppercase
                        px-5 py-2 rounded-full mb-8 backdrop-blur-sm"
             style={{
               opacity:    mounted ? 1 : 0,
               transform:  mounted ? 'translateY(0)' : 'translateY(12px)',
               transition: 'opacity 0.8s ease, transform 0.8s ease',
             }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
          Pentecostal · Warri · Delta State · Nigeria
        </div>

        {/* Church name */}
        <div style={{
               opacity:    mounted ? 1 : 0,
               transform:  mounted ? 'translateY(0)' : 'translateY(20px)',
               transition: 'opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s',
             }}>
          <h1 className="font-[family-name:var(--font-heading)] text-white leading-none mb-3">
            <span className="block text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Sure Word
            </span>
            <span className="block text-3xl sm:text-5xl lg:text-6xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #F5C518 0%, #B8860B 40%, #F5C518 70%, #92650A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
              Glorious Gospel
            </span>
            <span className="block text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Assembly
            </span>
          </h1>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6"
             style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
          <div className="h-px w-16 sm:w-24"
               style={{ background: 'linear-gradient(to right, transparent, rgba(184,134,11,0.6))' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
          <div className="h-px w-16 sm:w-24"
               style={{ background: 'linear-gradient(to left, transparent, rgba(184,134,11,0.6))' }} />
        </div>

        {/* Vision quote */}
        <p className="text-white/60 text-base sm:text-lg max-w-xl leading-relaxed italic mb-10"
           style={{
             opacity:    mounted ? 1 : 0,
             transform:  mounted ? 'translateY(0)' : 'translateY(12px)',
             transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
           }}>
          &ldquo;Raising a nation of discipled men who are rooted, grounded
          <br className="hidden sm:block" /> and are living in the Word.&rdquo;
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full
                        max-w-sm sm:max-w-none sm:justify-center mb-10"
             style={{
               opacity:    mounted ? 1 : 0,
               transform:  mounted ? 'translateY(0)' : 'translateY(12px)',
               transition: 'opacity 0.8s ease 0.55s, transform 0.8s ease 0.55s',
             }}>
          <Link href="/contact"
                className="group relative w-full sm:w-auto flex items-center
                           justify-center gap-2.5 px-8 py-4 rounded-2xl
                           font-bold text-base transition-all duration-300"
                style={{
                  background:  'linear-gradient(135deg, #B8860B 0%, #F5C518 50%, #B8860B 100%)',
                  backgroundSize: '200% 100%',
                  color:       '#0D1B2A',
                  boxShadow:   '0 0 30px rgba(184,134,11,0.3), 0 4px 20px rgba(0,0,0,0.3)',
                }}>
            <Calendar size={18} /> Plan a Visit
          </Link>
          <Link href="https://www.youtube.com/@SureWordGospel"
                className="group w-full sm:w-auto flex items-center justify-center
                           gap-2.5 px-8 py-4 rounded-2xl font-bold text-base
                           text-white border border-white/20 hover:border-white/40
                           hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center
                            justify-center flex-shrink-0">
              <Play size={10} className="text-white ml-0.5" fill="white" />
            </div>
            Watch Live
          </Link>
          <Link href="/give"
                className="group w-full sm:w-auto flex items-center justify-center
                           gap-2.5 px-8 py-4 rounded-2xl font-bold text-base
                           text-[#F5C518] border border-[rgba(184,134,11,0.4)]
                           hover:bg-[rgba(184,134,11,0.1)] backdrop-blur-sm
                           transition-all duration-300">
            <Heart size={18} /> Give Now
          </Link>
        </div>

        {/* Countdown */}
        <div className="w-full max-w-lg"
             style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 0.7s' }}>
          <div className="rounded-2xl px-6 py-4 backdrop-blur-md"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">
              Next Sunday Service
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {[
                { val: time.d, label: 'Days'  },
                { val: time.h, label: 'Hours' },
                { val: time.m, label: 'Mins'  },
                { val: time.s, label: 'Secs'  },
              ].map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center min-w-[40px]">
                    <div className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl
                                    font-bold text-[#F5C518] leading-none tabular-nums">
                      {unit.val}
                    </div>
                    <div className="text-white/30 text-[10px] uppercase tracking-wider mt-1">
                      {unit.label}
                    </div>
                  </div>
                  {i < 3 && <div className="text-white/20 text-xl font-bold mb-3">:</div>}
                </div>
              ))}
            </div>
            <p className="text-white/25 text-xs text-center mt-3">
              Sunday 8:00 AM WAT · Okwuisoko, Off Jakpa Road, Effurun, Warri
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8"
           style={{ opacity: mounted ? 0.4 : 0, transition: 'opacity 1s ease 1.2s' }}>
        <ChevronDown size={20} className="text-white/30 animate-bounce" />
      </div>
    </div>
  )
}

// ─── Slide 2: Camp Meeting ────────────────────────────────────────────────────
function CampMeetingSlide() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#040C18]">

      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.0) translateX(2%);  }
          50%  { transform: scale(1.03) translateX(-2%); }
          100% { transform: scale(1.0) translateX(2%);  }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
        }
        .swgga-slide-section {
          height: 100%;
        }
      `}</style>

      {/* Flyer background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0"
             style={{ animation: 'kenBurns 18s ease-in-out infinite', transformOrigin: 'center center' }}>
          <Image
            src={EVENT.flyer}
            alt={EVENT.label}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* Overlays */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-10"
           style={{ background: 'linear-gradient(to bottom, #040D1A 0%, rgba(4,13,26,0.5) 50%, transparent 100%)' }} />
      <div className="absolute inset-0 z-10"
           style={{ background: 'linear-gradient(to top, rgba(4,12,24,0.92) 0%, rgba(4,12,24,0.7) 20%, rgba(4,12,24,0.3) 50%, rgba(4,12,24,0.05) 100%)' }} />
      <div className="absolute inset-0 z-10"
           style={{ background: 'linear-gradient(to right, rgba(4,12,24,0.6) 0%, transparent 60%)' }} />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                             text-xs font-bold tracking-[0.2em] uppercase border"
                  style={{
                    animation:      'badgePulse 2.5s ease-in-out infinite',
                    background:     'rgba(239,68,68,0.15)',
                    borderColor:    'rgba(239,68,68,0.45)',
                    color:          '#FCA5A5',
                    backdropFilter: 'blur(8px)',
                  }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {EVENT.badge}
            </span>
          </motion.div>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#F5C518] text-xs font-bold tracking-[0.35em] uppercase mb-2"
          >
            {EVENT.label}
          </motion.p>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-5"
          >
            {[
              { icon: <Calendar size={13} />, text: EVENT.dates        },
              { icon: <Clock    size={13} />, text: EVENT.sessionTimes },
              { icon: <MapPin   size={13} />, text: EVENT.location     },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/80 text-sm">
                <span className="text-[#F5C518]">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Speakers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex flex-wrap gap-2 mb-7"
          >
            {EVENT.speakers.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
                className="px-3 py-1.5 rounded-xl border"
                style={{
                  background:     'rgba(255,255,255,0.08)',
                  borderColor:    'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p className="text-white text-xs font-semibold">{s.name}</p>
                <p className="text-[#F5C518]/60 text-[11px]">{s.role}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="flex flex-row gap-3"
          >
            <Link href="/contact"
                  className="inline-flex items-center justify-center px-7 py-3.5
                             rounded-xl font-bold text-sm text-[#0D1B2A]
                             transition-all duration-300"
                  style={{
                    background:  'linear-gradient(135deg, #B8860B 0%, #F5C518 50%, #B8860B 100%)',
                    boxShadow:   '0 0 30px rgba(184,134,11,0.4)',
                  }}>
              Register Now
            </Link>
            <Link href="/events"
                  className="inline-flex items-center justify-center px-7 py-3.5
                             rounded-xl font-semibold text-sm text-white
                             transition-all duration-300"
                  style={{
                    background:     'rgba(255,255,255,0.06)',
                    border:         '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(12px)',
                  }}>
              View Full Details
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

// ─── Hero Slider ──────────────────────────────────────────────────────────────
export default function HeroSlider() {
  const [active,   setActive]   = useState(0)
  const [paused,   setPaused]   = useState(false)
  const intervalRef             = useRef<NodeJS.Timeout | null>(null)
  const total                   = SLIDES.length

  const goTo = useCallback((index: number) => {
    setActive(((index % total) + total) % total)
  }, [total])

  // Autoplay
  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % total)
    }, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, total])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: '600px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* Slides */}
      <AnimatePresence mode="sync">
        {SLIDES.map((slide, i) => (
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ zIndex: i === active ? 1 : 0 }}
          >
            {slide.type === 'church'
              ? <ChurchSlide visible={i === active} />
              : <CampMeetingSlide />
            }
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo(active - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                   flex items-center justify-center text-white
                   hover:bg-[#B8860B]/60 transition-colors duration-200
                   border border-white/10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => goTo(active + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                   flex items-center justify-center text-white
                   hover:bg-[#B8860B]/60 transition-colors duration-200
                   border border-white/10"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20
                      flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300"
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === active ? '24px' : '8px',
                height:     '8px',
                background: i === active ? '#F5C518' : 'rgba(255,255,255,0.3)',
              }}
            />
          </button>
        ))}
      </div>

    </div>
  )
}