// src/components/public/home/HeroSection.tsx
// The first section visitors see — full-screen hero with vision statement
// and primary call-to-action buttons

import Link from 'next/link'

export default function HeroSection() {
  return (
    // Full-screen hero section with deep blue gradient background
    // min-h-screen = at least 100% of viewport height
    // relative = needed so we can position decorative elements inside it
    <section className="relative min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] flex items-start">

      {/* Subtle radial glow in the center — purely decorative */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184,134,11,0.08)_0%,transparent_60%)]" />

      {/* Content container — centered, max width, responsive padding */}
      {/* px-4 = 16px padding on mobile, sm:px-6 = 24px on small, lg:px-8 = 32px on large */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Two-column layout on desktop, stacked on mobile */}
        {/* grid-cols-1 = single column on mobile */}
        {/* lg:grid-cols-2 = two columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT COLUMN — Main content */}
          <div>

            {/* Ministry tag pill */}
            <div className="inline-block bg-[rgba(184,134,11,0.15)] border border-[rgba(184,134,11,0.3)]
                            text-[#F5C518] text-xs font-bold tracking-widest uppercase
                            px-4 py-2 rounded-full mb-6">
              Warri · Effurun · Delta State
            </div>

            {/* Church name — Playfair Display, large on desktop, responsive on mobile */}
            {/* font-[family-name:var(--font-heading)] applies our Playfair Display font */}
            {/* text-4xl = 36px on mobile, sm:text-5xl = 48px, lg:text-6xl = 60px */}
            <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl
                           font-bold text-white leading-tight mb-4">
              Sure Word{' '}
              <span className="text-[#B8860B]">Glorious</span>{' '}
              Gospel Assembly
            </h1>

            {/* Gold divider line */}
            <div className="w-16 h-1 bg-[#B8860B] rounded-full mb-6" />

            {/* Vision statement */}
            <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
              &ldquo;Raising a nation of discipled men who are grounded, rooted and are
              living in the Word of God.&rdquo;
            </p>

            {/* Pastor attribution */}
            <p className="text-[#B8860B] text-sm font-semibold tracking-wide mb-10">
              — Rev. Chijioke Igbani, Senior Pastor
            </p>

            {/* CTA BUTTONS */}
            {/* flex-col = stacked on mobile, sm:flex-row = side by side on small+ */}
            <div className="flex flex-col sm:flex-row gap-4">

              {/* Primary button — Plan a Visit */}
              <Link href="/contact"
                className="bg-[#B8860B] hover:bg-[#92650A] text-white font-bold
                           px-8 py-4 rounded-full text-center transition-all duration-200
                           shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Plan a Visit
              </Link>

              {/* Secondary button — Watch Live */}
              <Link href="/sermons/live"
                className="border-2 border-white text-white hover:bg-white hover:text-[#1E3A8A]
                           font-bold px-8 py-4 rounded-full text-center
                           transition-all duration-200">
                Watch Live
              </Link>

              {/* Tertiary button — Give Now */}
              <Link href="/give"
                className="border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white
                           font-bold px-8 py-4 rounded-full text-center
                           transition-all duration-200">
                Give Now
              </Link>

            </div>
          </div>

          {/* RIGHT COLUMN — Stats/Info cards (visible on large screens only) */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* Card 1 — Fast growing ministry */}
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                            rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-[#B8860B] text-3xl font-bold font-[family-name:var(--font-heading)] mb-1">
                Fast Growing
              </div>
              <div className="text-blue-200 text-sm">Ministry in Warri & Effurun</div>
            </div>

            {/* Card 2 — Ministries */}
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                            rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-[#B8860B] text-3xl font-bold font-[family-name:var(--font-heading)] mb-1">
                10+
              </div>
              <div className="text-blue-200 text-sm">Active Ministries</div>
            </div>

            {/* Card 3 — Daily devotional */}
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                            rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-[#B8860B] text-3xl font-bold font-[family-name:var(--font-heading)] mb-1">
                Daily
              </div>
              <div className="text-blue-200 text-sm">Prayer & Devotional with Pastor Chii</div>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom gold gradient fade — transitions into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r
                      from-transparent via-[#B8860B] to-transparent" />

    </section>
  )
}