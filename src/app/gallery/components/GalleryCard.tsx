'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, Tag } from 'lucide-react'

export interface GalleryPhotoItem {
  _id:         string
  title:       string
  description: string | null
  category:    string
  tags:        string[]
  date:        string | null
  featured:    boolean
  story:       { _id: string; title: string } | null
  image: {
    url:    string
    lqip:   string
    width:  number
    height: number
    alt:    string
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  history:         'History',
  sunday_service:  'Sunday Service',
  word_feast:      'Word Feast',
  youth_cty:       'Youth/CTY',
  healing_streams: 'Healing Streams',
  outreach:        'Outreach',
  conference:      'Conference',
  choir_worship:   'Choir/Worship',
  special_event:   'Special Event',
}

interface Props {
  photo:   GalleryPhotoItem
  index:   number
  onClick: (photo: GalleryPhotoItem) => void
}

export default function GalleryCard({ photo, index, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      onClick={() => onClick(photo)}
      className="relative cursor-pointer rounded-2xl overflow-hidden
                 bg-[#0A1628] group"
      style={{ breakInside: 'avoid', marginBottom: '16px' }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: `${photo.image.width} / ${photo.image.height}`,
        }}
      >
        <Image
          src={photo.image.url}
          alt={photo.image.alt ?? photo.title}
          fill
          className="object-cover transition-transform duration-700
                     group-hover:scale-105"
          placeholder={photo.image.lqip ? 'blur' : 'empty'}
          blurDataURL={photo.image.lqip}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t
                        from-[#060E1A] via-[#060E1A]/20 to-transparent
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-300" />

        {/* Featured badge */}
        {photo.featured && (
          <div className="absolute top-3 left-3 z-10
                          px-2 py-0.5 bg-[#B8860B] rounded-full
                          text-white text-[10px] font-bold tracking-wide">
            Featured
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 right-3 z-10
                        px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full
                        text-white text-[10px]">
          {CATEGORY_LABELS[photo.category] ?? photo.category}
        </div>

        {/* Slide-up caption on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10
                        translate-y-full group-hover:translate-y-0
                        transition-transform duration-300">
          <p className="text-white font-semibold text-sm line-clamp-1 mb-1">
            {photo.title}
          </p>
          <div className="flex items-center gap-3 text-[#94A3B8] text-xs">
            {photo.date && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {new Date(photo.date).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            )}
            {photo.story && (
              <span className="flex items-center gap-1">
                <Tag size={10} />
                {photo.story.title}
              </span>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}