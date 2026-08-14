'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'
import GalleryCard, { type GalleryPhotoItem } from './GalleryCard'
import GalleryLightbox from './GalleryLightbox'
import GalleryFilters from './GalleryFilters'

const PAGE_SIZE = 12

export default function GalleryGrid({ photos }: { photos: GalleryPhotoItem[] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [page,           setPage]           = useState(1)
  const [lightboxPhoto,  setLightboxPhoto]  = useState<GalleryPhotoItem | null>(null)

  // Filter + search
  const filtered = useMemo(() => {
    let result = photos
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q)                      ||
        (p.description ?? '').toLowerCase().includes(q)        ||
        (p.tags ?? []).some(t => t.toLowerCase().includes(q))  ||
        (p.date ?? '').includes(q)                             ||
        (p.story?.title ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [photos, activeCategory, searchQuery])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat)
    setPage(1)
  }

  function handleSearchChange(q: string) {
    setSearchQuery(q)
    setPage(1)
  }

  return (
    <>
      <GalleryFilters
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onCategory={handleCategoryChange}
        onSearch={handleSearchChange}
        totalCount={photos.length}
        filteredCount={filtered.length}
      />

      <section className="py-10 px-6 bg-[#060E1A] min-h-[50vh]">
        <div className="max-w-7xl mx-auto">

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center
                            py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0A1628]
                              border border-white/5 flex items-center
                              justify-center">
                <ImageOff size={24} className="text-[#334155]" />
              </div>
              <p className="text-[#64748B] text-sm">
                No photos match your search.
              </p>
            </div>
          ) : (
            <>
              {/* CSS masonry */}
              <div
                className="[column-count:1] sm:[column-count:2]
                           lg:[column-count:3]"
                style={{ columnGap: '16px' }}
              >
                {visible.map((photo, i) => (
                  <GalleryCard
                    key={photo._id}
                    photo={photo}
                    index={i}
                    onClick={setLightboxPhoto}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mt-12"
                >
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl
                               bg-[#0A1628] border border-white/10 text-white
                               text-sm font-semibold hover:border-[#B8860B]/40
                               hover:text-[#F5C518] transition-colors"
                  >
                    Load More Photos
                    <span className="text-[#64748B] text-xs">
                      ({filtered.length - visible.length} remaining)
                    </span>
                  </button>
                </motion.div>
              )}
            </>
          )}

        </div>
      </section>

      <GalleryLightbox
        photo={lightboxPhoto}
        photos={filtered}
        onClose={() => setLightboxPhoto(null)}
        onNav={setLightboxPhoto}
      />
    </>
  )
}