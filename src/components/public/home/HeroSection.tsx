'use client'
// HeroSection - world-class elevated hero for SWGGA
// Features: atmospheric background, animated text reveal,
// live countdown to next Sunday service, premium button styling

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Heart, Calendar, ChevronDown } from 'lucide-react'

function useNextSundayCountdown() {
  const [time, setTime] = useState({ d: '0', h: '00', m: '00', s: '00' })
  useEffect(() => {
    function update() {
      const now = new Date()
      const next = new Date(now)
      // Find next Sunday 8AM WAT (UTC+1)
      const dayOfWeek = now.getDay() // 0=Sun
      const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek
      next.setDate(now.getDate() + daysUntilSunday)
      next.setHours(7, 0, 0, 0) // 8AM WAT = 7AM UTC
      const diff = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
      const d = Math.floor(diff / 86400)
      const h = Math.floor((diff % 86400) / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setTime({
        d: String(d),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const time = useNextSundayCountdown()

  useEffect(() => {
    // Staggered mount animation trigger
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ── BACKGROUND LAYERS ──────────────────────────────────────────── */}
      {/* Deep navy base */}
      <div className="absolute inset-0 bg-[#040D1A]" />

      {/* Atmospheric radial light - top centre */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,58,138,0.7) 0%, transparent 70%)' }} />

      {/* Gold atmospheric glow - bottom left */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 15% 90%, rgba(184,134,11,0.15) 0%, transparent 60%)' }} />

      {/* Gold atmospheric glow - top right */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 40% 40% at 85% 10%, rgba(184,134,11,0.1) 0%, transparent 60%)' }} />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

      {/* Light ray from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(184,134,11,0.6), transparent)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '400px', height: '300px', background: 'radial-gradient(ellipse at top, rgba(184,134,11,0.08) 0%, transparent 70%)', transform: 'translateX(-50%)' }} />

      {/* ── HERO CONTENT ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">

        {/* Location pill */}
        <div
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-xs font-semibold tracking-widest uppercase px-5 py-2 rounded-full mb-8 backdrop-blur-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
          Pentecostal · Warri · Delta State · Nigeria
        </div>

        {/* Main heading */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s',
          }}
        >
          <h1 className="font-[family-name:var(--font-heading)] text-white leading-none mb-3">
            <span className="block text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Sure Word</span>
            <span
              className="block text-4xl sm:text-6xl lg:text-7xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #F5C518 0%, #B8860B 40%, #F5C518 70%, #92650A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Glorious Gospel
            </span>
            <span className="block text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Assembly</span>
          </h1>
        </div>

        {/* Gold divider */}
        <div
          className="flex items-center gap-3 my-6"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 0.3s',
          }}
        >
          <div className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(to right, transparent, rgba(184,134,11,0.6))' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
          <div className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(to left, transparent, rgba(184,134,11,0.6))' }} />
        </div>

        {/* Vision quote */}
        <p
          className="text-white/60 text-base sm:text-lg max-w-xl leading-relaxed italic mb-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
          }}
        >
          &ldquo;Raising a nation of discipled men who are grounded, rooted<br className="hidden sm:block" /> and are living in the Word of God.&rdquo;
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm sm:max-w-none sm:justify-center mb-12"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease 0.55s, transform 0.8s ease 0.55s',
          }}
        >
          {/* Primary CTA - Plan a Visit */}
          <Link href="/contact"
            className="group relative w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base overflow-hidden transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #B8860B 0%, #F5C518 50%, #B8860B 100%)',
              backgroundSize: '200% 100%',
              color: '#0D1B2A',
              boxShadow: '0 0 30px rgba(184,134,11,0.3), 0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <Calendar size={18} />
            Plan a Visit
          </Link>

          {/* Secondary CTA - Watch Live */}
          <Link href="/ministries/pastor-chii-daily"
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white border border-white/20 hover:border-white/40 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
          >
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <Play size={10} className="text-white ml-0.5" fill="white" />
            </div>
            Watch Live
          </Link>

          {/* Tertiary CTA - Give */}
          <Link href="/give"
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-[#F5C518] border border-[rgba(184,134,11,0.4)] hover:bg-[rgba(184,134,11,0.1)] backdrop-blur-sm transition-all duration-300"
          >
            <Heart size={18} />
            Give Now
          </Link>
        </div>

        {/* NEXT SERVICE COUNTDOWN */}
        <div
          className="w-full max-w-lg"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 0.7s',
          }}
        >
          <div
            className="rounded-2xl px-6 py-4 backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">Next Sunday Service</p>
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {[
                { val: time.d, label: 'Days' },
                { val: time.h, label: 'Hours' },
                { val: time.m, label: 'Mins' },
                { val: time.s, label: 'Secs' },
              ].map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center min-w-[40px]">
                    <div className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#F5C518] leading-none tabular-nums">
                      {unit.val}
                    </div>
                    <div className="text-white/30 text-[10px] uppercase tracking-wider mt-1">{unit.label}</div>
                  </div>
                  {i < 3 && <div className="text-white/20 text-xl font-bold mb-3">:</div>}
                </div>
              ))}
            </div>
            <p className="text-white/25 text-xs text-center mt-3">Sunday 8:00 AM WAT · Okwuisoko, Off Jakpa Road, Effurun, Warri</p>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8"
        style={{ opacity: mounted ? 0.4 : 0, transition: 'opacity 1s ease 1.2s' }}>
        <div className="flex flex-col items-center gap-1 text-white/30 text-xs">
          <ChevronDown size={20} className="animate-bounce" />
        </div>
      </div>

    </section>
  )
}
