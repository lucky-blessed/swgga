'use client'

import { motion } from 'framer-motion'

export default function GalleryHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center
                        overflow-hidden bg-[#060E1A]">

      {/* Radial gold glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full
                        bg-[#B8860B]/10 blur-[120px]" />
      </div>

      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[#F5C518] text-sm font-semibold tracking-[0.3em]
                     uppercase mb-4"
        >
          Sure Word Glorious Gospel Assembly
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Our Journey
          <span className="block text-[#F5C518]">of Faith</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto
                     leading-relaxed"
        >
          Every image here carries the fingerprints of God. Browse through the
          moments, milestones, and memories that have shaped this house of glory.
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-white/20
                       flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2.5 bg-[#F5C518] rounded-full" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}