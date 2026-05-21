// Sermons page — pulls live sermon data from Sanity CMS
// Falls back to a loading state while fetching
// Uses 'use client' because of the filter/search interactivity

'use client'

import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Play, Headphones, FileText, Mic, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import { latestSermonsQuery } from '@/sanity/lib/queries'

// Badge colour per sermon type
const TYPE_BADGE: Record<string, string> = {
  video:   'bg-[#EBF0FA] text-[#1E3A8A]',
  audio:   'bg-[#FDF6E3] text-[#92650A]',
  podcast: 'bg-[#FDF6E3] text-[#B8860B]',
  notes:   'bg-[#DCFCE7] text-[#166534]',
}

// Icon shown in sermon thumbnail based on type
function ThumbIcon({ type }: { type: string }) {
  if (type === 'video') {
    return (
      <div className="w-14 h-14 bg-[#B8860B] rounded-full flex items-center justify-center shadow-lg">
        <Play size={24} className="text-white ml-1" />
      </div>
    )
  }
  if (type === 'audio') return <Headphones size={34} className="text-white/40" />
  if (type === 'podcast') return <Mic size={34} className="text-white/40" />
  return <FileText size={34} className="text-white/40" />
}

// Gradient colours cycle for sermon thumbnails when no image is provided
const GRADIENTS = [
  'from-[#0D1B2A] to-[#1E3A8A]',
  'from-[#0D1B2A] to-[#152D6E]',
  'from-[#1E3A8A] to-[#166534]',
  'from-[#92650A] to-[#B8860B]',
  'from-[#0D1B2A] to-[#1E3A8A]',
  'from-[#166534] to-[#0D3320]',
  'from-[#1E3A8A] to-[#9333EA]',
  'from-[#92650A] to-[#0D1B2A]',
]

export default function SermonsPage() {
  const [sermons, setSermons] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')

  // Fetch sermons from Sanity on page load
  useEffect(() => {
    client.fetch(latestSermonsQuery).then((data: any[]) => {
      setSermons(data || [])
      setFiltered(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Filter sermons whenever search or type filter changes
  useEffect(() => {
    let results = sermons
    if (typeFilter !== 'All Types') {
      results = results.filter(s => s.sermonType === typeFilter.toLowerCase())
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.speaker?.toLowerCase().includes(q) ||
        s.scripture?.toLowerCase().includes(q) ||
        s.series?.toLowerCase().includes(q)
      )
    }
    setFiltered(results)
  }, [search, typeFilter, sermons])

  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* PAGE HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">
            Sermons and Media
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Watch, listen, read — messages to ground you, root you, and keep you living in the Word
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* FILTER BAR — type filter + search */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white outline-none focus:border-[#1E3A8A] cursor-pointer"
          >
            {['All Types', 'Video', 'Audio', 'Podcast', 'Notes'].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sermons..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]"
            />
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Now
          </div>
        </div>

        {/* PODCAST BAR */}
        <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1E3A8A] rounded-2xl p-5 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#B8860B] rounded-xl flex items-center justify-center flex-shrink-0">
            <Mic size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-base mb-0.5">Sure Word Daily Podcast</h4>
            <p className="text-blue-200 text-sm">New episode every morning · Rev. Chijioke Igbani</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Spotify', 'Apple Podcasts', 'Google Podcasts', 'RSS Feed'].map((p) => (
                <div key={p} className="bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SERMON GRID */}
        {loading ? (
          // Loading skeleton — shows while Sanity data is being fetched
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-bold mb-2">No sermons found</p>
            <p className="text-sm">
              {sermons.length === 0
                ? 'No sermons have been published yet. Check back soon.'
                : 'Try a different search term or filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {filtered.map((sermon, i) => (
              <div
                key={sermon._id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                onClick={() => { const url = sermon.facebookUrl || sermon.youtubeUrl; if (url) window.open(url, '_blank') }}
              >
                {/* Thumbnail — uses Sanity image if available, otherwise gradient */}
                <div className={`bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} aspect-video flex items-center justify-center`}
                  style={sermon.thumbnailUrl ? { backgroundImage: `url(${sermon.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                  {!sermon.thumbnailUrl && <ThumbIcon type={sermon.sermonType} />}
                </div>
                <div className="p-4">
                  <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${TYPE_BADGE[sermon.sermonType] || TYPE_BADGE['video']}`}>
                    {sermon.sermonType?.charAt(0).toUpperCase() + sermon.sermonType?.slice(1)}
                  </div>
                  <h4 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[#1A1A1A] leading-snug mb-1 group-hover:text-[#1E3A8A] transition-colors">
                    {sermon.title}
                  </h4>
                  <p className="text-gray-400 text-xs">
                    {sermon.speaker} · {sermon.publishedAt ? new Date(sermon.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} {sermon.duration ? `· ${sermon.duration}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOAD MORE — only shown when there are results */}
        {filtered.length > 0 && (
          <div className="text-center pb-12">
            <button className="border-2 border-gray-200 hover:border-[#1E3A8A] text-gray-500 hover:text-[#1E3A8A] font-bold px-8 py-3 rounded-full transition-colors duration-200 text-sm">
              Load More Sermons
            </button>
          </div>
        )}

      </div>
      <Footer />
    </main>
  )
}
