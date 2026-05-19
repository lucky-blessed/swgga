// src/components/public/home/FeaturedSermon.tsx
// Featured sermon section — two column layout
// Left: video player placeholder | Right: sermon details

import Link from 'next/link'
import { Play, Headphones, FileText } from 'lucide-react'

export default function FeaturedSermon() {
  return (
    // White background section
    // sec = section with standard padding
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-10">
          <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-2">
            Latest Message
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl
                         font-bold text-[#1A1A1A] mb-3">
            Featured Sermon
          </h2>
          <p className="text-gray-400 text-base">
            A fresh word from Rev. Chijioke Igbani — watch, listen, or download the notes
          </p>
        </div>

        {/* Two column grid */}
        {/* On mobile: stacked. On large screens: side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT — Video player placeholder */}
          {/* When real sermons are connected from Sanity this becomes a YouTube embed */}
          <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1E3A8A] rounded-2xl
                          aspect-video flex flex-col items-center justify-center
                          gap-4 relative overflow-hidden">

            {/* Subtle gold radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,134,11,0.1)_0%,transparent_60%)]" />

            {/* Play button */}
            <button className="relative z-10 w-16 h-16 bg-[#B8860B] hover:bg-[#92650A]
                               rounded-full flex items-center justify-center
                               transition-all duration-200 shadow-lg hover:scale-105">
              <Play size={26} className="text-white ml-1" />
            </button>

            {/* Duration badge */}
            <span className="relative z-10 text-white/40 text-xs tracking-widest">
              42:18 · HD
            </span>

          </div>

          {/* RIGHT — Sermon details */}
          <div>

            {/* Content type badge */}
            <div className="inline-block bg-[#EBF0FA] text-[#1E3A8A] text-xs font-bold
                            tracking-wider uppercase px-3 py-1 rounded-full mb-4">
              Video Sermon
            </div>

            {/* Sermon title */}
            <h3 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl
                           font-bold text-[#1A1A1A] mb-3 leading-snug">
              Glory and His Secret Place
            </h3>

            {/* Sermon meta — speaker, scripture, date */}
            <p className="text-gray-400 text-sm mb-4">
              Rev. Chijioke Igbani &nbsp;·&nbsp; Psalm 91:1 &nbsp;·&nbsp; Sunday, May 17, 2026
            </p>

            {/* Sermon description */}
            <p className="text-[#374151] text-sm leading-relaxed mb-6">
              A powerful message on the Holy Place.
              Not as a one-time event but a daily, continuous walk of surrender and
              obedience to God&apos;s Word.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">

              {/* Watch — primary blue button */}
              <Link href="/sermons"
                className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#0F2460]
                           text-white text-sm font-bold px-5 py-3 rounded-full
                           transition-colors">
                <Play size={14} /> Watch
              </Link>

              {/* Listen — ghost button */}
              <Link href="/sermons"
                className="flex items-center gap-2 border-2 border-gray-200
                           hover:border-[#1E3A8A] text-gray-500 hover:text-[#1E3A8A]
                           text-sm font-bold px-5 py-3 rounded-full transition-colors">
                <Headphones size={14} /> Listen
              </Link>

              {/* Notes — ghost button */}
              <Link href="/sermons"
                className="flex items-center gap-2 border-2 border-gray-200
                           hover:border-[#1E3A8A] text-gray-500 hover:text-[#1E3A8A]
                           text-sm font-bold px-5 py-3 rounded-full transition-colors">
                <FileText size={14} /> Notes
              </Link>

            </div>

          </div>
        </div>
      </div>
    </section>
  )
}