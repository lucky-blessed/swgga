'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X, ChevronLeft, ChevronRight,
  Calendar, Share2, Download, Tag,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import type { GalleryPhotoItem } from './GalleryCard'

interface Props {
  photo:   GalleryPhotoItem | null
  photos:  GalleryPhotoItem[]
  onClose: () => void
  onNav:   (photo: GalleryPhotoItem) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  history:         'Church History',
  sunday_service:  'Sunday Service',
  word_feast:      'Word Feast',
  youth_cty:       'Youth and CTY',
  healing_streams: 'Healing Streams',
  outreach:        'Outreach',
  conference:      'Conference',
  choir_worship:   'Choir and Worship',
  special_event:   'Special Event',
}

export default function GalleryLightbox({ photo, photos, onClose, onNav }: Props) {
  const currentIndex = photo ? photos.findIndex(p => p._id === photo._id) : -1
  const hasPrev      = currentIndex > 0
  const hasNext      = currentIndex < photos.length - 1

  const prev = useCallback(() => {
    if (hasPrev) onNav(photos[currentIndex - 1])
  }, [hasPrev, currentIndex, photos, onNav])

  const next = useCallback(() => {
    if (hasNext) onNav(photos[currentIndex + 1])
  }, [hasNext, currentIndex, photos, onNav])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, prev, next])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = photo ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [photo])

  function shareWhatsApp() {
    if (!photo) return
    const text = `${photo.title} — Sure Word Glorious Gospel Assembly\n${photo.image.url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function shareNative() {
    if (!photo || !navigator.share) return
    navigator.share({
      title: photo.title,
      text:  `${photo.title} — Sure Word Glorious Gospel Assembly`,
      url:   photo.image.url,
    }).catch(() => {})
  }

  return (
    <AnimatePresence>
      {photo && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex items-center
                       justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-6xl max-h-[90vh]
                         bg-[#0A1628] border border-white/10 rounded-2xl
                         overflow-hidden flex flex-col md:flex-row
                         pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative flex-1 min-h-[50vh] md:min-h-0 bg-black">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={photo._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={photo.image.url}
                      alt={photo.image.alt ?? photo.title}
                      fill
                      className="object-contain"
                      placeholder={photo.image.lqip ? 'blur' : 'empty'}
                      blurDataURL={photo.image.lqip}
                      sizes="(max-width: 768px) 100vw, 70vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Prev */}
                {hasPrev && (
                  <button
                    onClick={prev}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2
                               w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm
                               flex items-center justify-center text-white
                               hover:bg-[#B8860B] transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Next */}
                {hasNext && (
                  <button
                    onClick={next}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm
                               flex items-center justify-center text-white
                               hover:bg-[#B8860B] transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}

                {/* Counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2
                                px-3 py-1 bg-black/60 backdrop-blur-sm
                                rounded-full text-white text-xs">
                  {currentIndex + 1} / {photos.length}
                </div>
              </div>

              {/* Info panel */}
              <div className="w-full md:w-80 flex flex-col bg-[#0A1628]
                              border-t md:border-t-0 md:border-l border-white/5">

                {/* Header */}
                <div className="flex items-center justify-between
                                px-5 py-4 border-b border-white/5">
                  <span className="text-[#64748B] text-xs">
                    {CATEGORY_LABELS[photo.category] ?? photo.category}
                  </span>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10
                               flex items-center justify-center text-[#64748B]
                               hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                  <h2
                    className="text-white font-semibold text-base leading-snug"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {photo.title}
                  </h2>

                  {photo.description && (
                    <p className="text-[#94A3B8] text-sm leading-relaxed">
                      {photo.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {photo.date && (
                      <div className="flex items-center gap-2
                                      text-[#64748B] text-xs">
                        <Calendar size={12} />
                        <span>
                          {new Date(photo.date).toLocaleDateString('en-GB', {
                            weekday: 'long', day: '2-digit',
                            month: 'long', year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    {photo.story && (
                      <div className="flex items-center gap-2
                                      text-[#64748B] text-xs">
                        <Tag size={12} />
                        <span>{photo.story.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t border-white/5 space-y-2">
                  <button
                    onClick={shareWhatsApp}
                    className="w-full flex items-center justify-center gap-2
                               py-2.5 rounded-xl bg-[#25D366]/20
                               border border-[#25D366]/30 text-[#25D366]
                               text-sm font-semibold hover:bg-[#25D366]/30
                               transition-colors"
                  >
                    <FaWhatsapp size={15} /> Share on WhatsApp
                  </button>

                  {'share' in navigator && (
                    <button
                      onClick={shareNative}
                      className="w-full flex items-center justify-center gap-2
                                 py-2.5 rounded-xl bg-white/5 border border-white/10
                                 text-[#94A3B8] text-sm hover:text-white
                                 hover:border-white/20 transition-colors"
                    >
                      <Share2 size={14} /> Share
                    </button>
                  )}

                  <a
                  
                    href={`${photo.image.url}?dl=`}
                    download
                    className="w-full flex items-center justify-center gap-2
                               py-2.5 rounded-xl bg-white/5 border border-white/10
                               text-[#94A3B8] text-sm hover:text-white
                               hover:border-white/20 transition-colors"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}