'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface StoryPhoto {
  _id:   string
  title: string
  image: {
    url:    string
    lqip:   string
    alt:    string
  }
}

interface Story {
  _id:         string
  title:        string
  description:  string | null
  slug:         string
  coverImage:   { url: string; lqip: string; alt: string } | null
  photos:       StoryPhoto[]
}

export default function StorySection({ stories }: { stories: Story[] }) {
  if (!stories.length) return null

  return (
    <section className="py-16 px-6 bg-[#060E1A]">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-[#F5C518] text-xs font-semibold tracking-widest
                        uppercase mb-2">
            Church Stories
          </p>
          <h2
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Chapters of Glory
          </h2>
        </motion.div>

        {/* Horizontal scroll on mobile, 3-col grid on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory
                        md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
             style={{ scrollbarWidth: 'none' }}>
          {stories.map((story, i) => (
            <motion.div
              key={story._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex-shrink-0 w-72 md:w-auto snap-start
                         bg-[#0A1628] border border-white/5 rounded-2xl
                         overflow-hidden group cursor-pointer
                         hover:border-[#B8860B]/30 transition-colors duration-300"
            >
              {/* Photo collage */}
              <div className="relative h-44 overflow-hidden bg-[#0F1E35]">
                {story.photos.slice(0, 3).map((p, idx) => (
                  <div
                    key={p._id}
                    className="absolute inset-0"
                    style={{
                      zIndex:   3 - idx,
                      opacity:  idx === 0 ? 1 : 0.35 + idx * 0.1,
                    }}
                  >
                    <Image
                      src={p.image.url}
                      alt={p.image.alt ?? story.title}
                      fill
                      className="object-cover group-hover:scale-105
                                 transition-transform duration-700"
                      placeholder={p.image.lqip ? 'blur' : 'empty'}
                      blurDataURL={p.image.lqip}
                      sizes="(max-width: 768px) 288px, 33vw"
                    />
                  </div>
                ))}

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t
                                from-[#0A1628] via-transparent to-transparent
                                z-10" />

                {/* Photo count badge */}
                <div className="absolute top-3 right-3 z-20
                                px-2 py-0.5 bg-black/60 backdrop-blur-sm
                                rounded-full text-white text-[10px]">
                  {story.photos.length} photos
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-1
                               group-hover:text-[#F5C518] transition-colors">
                  {story.title}
                </h3>
                {story.description && (
                  <p className="text-[#64748B] text-xs line-clamp-2
                                leading-relaxed">
                    {story.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}