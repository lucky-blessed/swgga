// FeaturedSermon — premium sermon showcase
// Dark blue card, video thumbnail, Watch/Listen/Notes CTA trio
import Link from 'next/link'
import { Play, Headphones, FileText, ArrowRight } from 'lucide-react'

export default function FeaturedSermon() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">Latest Message</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A]">Featured Sermon</h2>
            <p className="text-gray-400 text-base mt-1">A fresh word from Rev. Chijioke Igbani</p>
          </div>
          <Link href="/sermons"
            className="hidden sm:flex items-center gap-2 text-[#1E3A8A] hover:text-[#B8860B] text-sm font-bold transition-colors">
            All Sermons <ArrowRight size={16} />
          </Link>
        </div>

        {/* Sermon card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 60%, #0F2460 100%)',
            boxShadow: '0 24px 64px rgba(30,58,138,0.3), 0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex flex-col lg:flex-row">

            {/* Video thumbnail */}
            <div className="lg:w-1/2 relative" style={{ minHeight: '280px' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Glow behind play button */}
                <div className="absolute w-32 h-32 rounded-full opacity-30 blur-2xl"
                  style={{ background: 'radial-gradient(circle, #B8860B, transparent)' }} />
                <button
                  className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #B8860B, #F5C518)',
                    boxShadow: '0 0 40px rgba(184,134,11,0.5)',
                  }}
                >
                  <Play size={28} className="text-white ml-1.5" fill="white" />
                </button>
                <p className="text-white/40 text-xs mt-4 font-mono">42:18 · HD</p>
              </div>
              {/* Subtle diagonal separator */}
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-16"
                style={{ background: 'linear-gradient(to right, transparent, rgba(14,26,52,0.8))' }} />
            </div>

            {/* Sermon info */}
            <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
              <div className="inline-block bg-[rgba(184,134,11,0.2)] border border-[rgba(184,134,11,0.3)] text-[#F5C518] text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 w-fit">
                Video Sermon
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">
                Glory and His Secret Place
              </h3>
              <p className="text-white/50 text-sm mb-4">
                Rev. Chijioke Igbani &nbsp;·&nbsp; Psalm 91:1 &nbsp;·&nbsp; Sunday, May 17, 2026
              </p>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                A powerful message on the Holy Place. Not as a one-time event but a daily, continuous walk of surrender and obedience to God&apos;s Word.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Play,        label: 'Watch',  style: 'bg-[#B8860B] hover:bg-[#92650A] text-white' },
                  { icon: Headphones,  label: 'Listen', style: 'bg-white/10 hover:bg-white/20 text-white border border-white/20' },
                  { icon: FileText,    label: 'Notes',  style: 'bg-white/10 hover:bg-white/20 text-white border border-white/20' },
                ].map(({ icon: Icon, label, style }) => (
                  <button key={label}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${style}`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
