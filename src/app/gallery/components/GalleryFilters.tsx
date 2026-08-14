'use client'

import { Search, X } from 'lucide-react'
import { GALLERY_CATEGORIES } from '@/sanity/schemaTypes/galleryPhoto'

const ALL_CATEGORIES = [
  { title: 'All Photos', value: 'all' },
  ...GALLERY_CATEGORIES,
]

interface Props {
  activeCategory: string
  searchQuery:    string
  onCategory:     (cat: string) => void
  onSearch:       (q: string)   => void
  totalCount:     number
  filteredCount:  number
}

export default function GalleryFilters({
  activeCategory,
  searchQuery,
  onCategory,
  onSearch,
  totalCount,
  filteredCount,
}: Props) {
  return (
    <div className="sticky top-0 z-20 bg-[#060E1A]/90 backdrop-blur-md
                    border-b border-white/5 py-4 px-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Search */}
        <div className="relative max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search by name, year, or keyword..."
            className="w-full bg-[#0A1628] border border-white/10 rounded-xl
                       pl-9 pr-9 py-2.5 text-white text-sm
                       focus:outline-none focus:border-[#B8860B]/50
                       placeholder:text-[#334155]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-[#64748B] hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => onCategory(cat.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs
                          font-semibold transition-all duration-200
                          ${activeCategory === cat.value
                            ? 'bg-[#B8860B] text-white shadow-[0_0_12px_rgba(184,134,11,0.4)]'
                            : 'bg-[#0A1628] border border-white/10 text-[#94A3B8] hover:border-[#B8860B]/40 hover:text-white'
                          }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-[#475569] text-xs">
          {searchQuery || activeCategory !== 'all'
            ? `Showing ${filteredCount} of ${totalCount} photos`
            : `${totalCount} photos`
          }
        </p>

      </div>
    </div>
  )
}