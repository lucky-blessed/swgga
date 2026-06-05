'use client'
// FeaturedSermon - carousel of latest sermons
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Play, Headphones, FileText, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Sermon {
  id: string; title: string; speaker: string; scripture: string
  sermon_date: string; content_type: string; video_url: string | null
  audio_url: string | null; notes_url: string | null; description: string | null
  thumbnail_url: string | null
}

function getTypeLabel(t: string) {
  return ({ video_youtube: 'Video Sermon', video_facebook: 'Video Sermon', audio_s3: 'Audio Sermon', podcast: 'Podcast' })[t] ?? 'Sermon'
}

export default function FeaturedSermon() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [idx, setIdx]         = useState(0)
  const [paused, setPaused]   = useState(false)

  useEffect(() => {
    fetch('/api/v1/sermons?limit=5').then(r => r.json())
      .then(d => setSermons(d.sermons ?? [])).catch(() => {})
  }, [])

  const next = useCallback(() => setIdx(i => (i + 1) % sermons.length), [sermons.length])
  const prev = useCallback(() => setIdx(i => (i - 1 + sermons.length) % sermons.length), [sermons.length])

  useEffect(() => {
    if (sermons.length <= 1 || paused) return
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [sermons.length, paused, next])

  const s = sermons[idx]

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">Latest Messages</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A]">Featured Sermons</h2>
            <p className="text-gray-400 text-base mt-1">Fresh words from Rev. Chijioke Igbani</p>
          </div>
          <Link href="/sermons"
            className="hidden sm:flex items-center gap-2 text-[#1E3A8A] hover:text-[#B8860B] text-sm font-bold transition-colors">
            All Sermons <ArrowRight size={16} />
          </Link>
        </div>

        {/* Sermon carousel */}
        {s ? (
          <div className="rounded-3xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 60%, #0F2460 100%)', boxShadow: '0 24px 64px rgba(30,58,138,0.3)' }}
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 relative" style={{ minHeight: '280px', ...(s.thumbnail_url ? { backgroundImage: `url(${s.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
                {s.thumbnail_url && <div className="absolute inset-0 bg-[#0A1628]/50" />}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full opacity-30 blur-2xl" style={{ background: 'radial-gradient(circle, #B8860B, transparent)' }} />
                  {s.video_url ? (
                    <a href={s.video_url} target="_blank" rel="noopener noreferrer"
                      className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #B8860B, #F5C518)', boxShadow: '0 0 40px rgba(184,134,11,0.5)' }}>
                      <Play size={28} className="text-white ml-1.5" fill="white" />
                    </a>
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #B8860B, #F5C518)' }}>
                      <Play size={28} className="text-white ml-1.5" fill="white" />
                    </div>
                  )}
                </div>
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(14,26,52,0.8))' }} />
              </div>
              <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
                <div className="inline-block bg-[rgba(184,134,11,0.2)] border border-[rgba(184,134,11,0.3)] text-[#F5C518] text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 w-fit">
                  {getTypeLabel(s.content_type)}
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">{s.title}</h3>
                <p className="text-white/50 text-sm mb-4">{s.speaker}{s.scripture && <>&nbsp;·&nbsp;{s.scripture}</>}{s.sermon_date && <>&nbsp;·&nbsp;{new Date(s.sermon_date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</>}</p>
                {s.description && <p className="text-white/60 text-sm leading-relaxed mb-8 line-clamp-3">{s.description}</p>}
                <div className="flex flex-wrap gap-3">
                  {s.video_url && <a href={s.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#B8860B] hover:bg-[#92650A] text-white transition-all"><Play size={15} /> Watch</a>}
                  {s.audio_url && <a href={s.audio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"><Headphones size={15} /> Listen</a>}
                  {s.notes_url && <a href={s.notes_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"><FileText size={15} /> Notes</a>}
                </div>
              </div>
            </div>
            {sermons.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white"><ChevronLeft size={18} /></button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white"><ChevronRight size={18} /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {sermons.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-[#F5C518]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />)}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-3xl p-10 text-center animate-pulse" style={{ background: 'linear-gradient(135deg, #0A1628, #1E3A8A)', minHeight: 320 }} />
        )}

      </div>
    </section>
  )
}
