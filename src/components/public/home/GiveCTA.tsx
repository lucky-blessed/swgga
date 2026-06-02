// src/components/public/home/GiveCTA.tsx
// Full-width giving call-to-action band
// Dark blue gradient background with gold Give Now button

import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function GiveCTA() {
  return (
    <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Gold pill eyebrow */}
        <div className="inline-block bg-[rgba(184,134,11,0.2)] border border-[rgba(184,134,11,0.4)]
                        text-[#F5C518] text-xs font-bold tracking-widest uppercase
                        px-4 py-2 rounded-full mb-6">
          Give Online - Nigeria &amp; Worldwide
        </div>

        {/* Heading */}
        <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl
                       font-bold text-white mb-4">
          Your Giving Fuels the Vision
        </h2>

        {/* Subtext */}
        <p className="text-blue-200 text-base sm:text-lg leading-relaxed mb-8">
          Every gift helps us raise a nation of discipled men - grounded, rooted,
          and living in the Word of God.
        </p>

        {/* Give Now button */}
        <Link href="/give"
          className="inline-flex items-center gap-2 bg-[#B8860B] hover:bg-[#92650A]
                     text-white font-bold px-8 py-4 rounded-full
                     transition-all duration-200 shadow-lg hover:shadow-xl
                     hover:-translate-y-0.5 transform">
          <Heart size={18} /> Give Now
        </Link>

      </div>
    </section>
  )
}