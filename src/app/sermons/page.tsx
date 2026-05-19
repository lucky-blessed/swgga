import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Play, Headphones, FileText, Mic, Search } from 'lucide-react'
import Link from 'next/link'

const sermons = [
  { type: 'video',   title: 'Walking in the Fullness of the Spirit',  meta: 'Rev. C. Igbani · 2 Feb 2026 · 42 min',  gradient: 'from-[#0D1B2A] to-[#1E3A8A]' },
  { type: 'audio',   title: 'The Power of Persistent Prayer',          meta: 'Rev. C. Igbani · 26 Jan 2026 · 38 min', gradient: 'from-[#0D1B2A] to-[#152D6E]' },
  { type: 'video',   title: "God's Blueprint for Marriage",            meta: 'Rev. C. Igbani · 19 Jan 2026 · 51 min', gradient: 'from-[#1E3A8A] to-[#166534]' },
  { type: 'podcast', title: 'Daily Devotion: Proverbs 3:5-6',         meta: 'Rev. C. Igbani · 12 Jan 2026 · 14 min', gradient: 'from-[#92650A] to-[#B8860B]' },
  { type: 'video',   title: 'Raised to Walk in Newness of Life',       meta: 'Rev. C. Igbani · 5 Jan 2026 · 44 min',  gradient: 'from-[#0D1B2A] to-[#1E3A8A]' },
  { type: 'notes',   title: 'Walking in the Spirit — Study Notes',     meta: '2 Feb 2026 · PDF · 4 pages',            gradient: 'from-[#166534] to-[#0D3320]'  },
  { type: 'video',   title: 'The Discipline of Fasting',               meta: 'Rev. C. Igbani · 29 Dec 2025 · 39 min', gradient: 'from-[#1E3A8A] to-[#9333EA]'  },
  { type: 'audio',   title: 'Faith for the Impossible',                meta: 'Rev. C. Igbani · 22 Dec 2025 · 47 min', gradient: 'from-[#92650A] to-[#0D1B2A]'  },
]

const TYPE_BADGE: Record<string, string> = {
  video:   'bg-[#EBF0FA] text-[#1E3A8A]',
  audio:   'bg-[#FDF6E3] text-[#92650A]',
  podcast: 'bg-[#FDF6E3] text-[#B8860B]',
  notes:   'bg-[#DCFCE7] text-[#166534]',
}

const TYPE_LABEL: Record<string, string> = {
  video:   'Video',
  audio:   'Audio',
  podcast: 'Podcast',
  notes:   'Notes',
}

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

export default function SermonsPage() {
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
            Watch, listen, read; messages to ground you, root you, and keep you living in the Word
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white outline-none focus:border-[#1E3A8A] cursor-pointer">
            <option>All Types</option>
            <option>Video</option>
            <option>Audio</option>
            <option>Podcast</option>
            <option>Notes</option>
          </select>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white outline-none focus:border-[#1E3A8A] cursor-pointer">
            <option>All Series</option>
            <option>Walking in the Spirit</option>
            <option>Marriage Matters</option>
          </select>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white outline-none focus:border-[#1E3A8A] cursor-pointer">
            <option>All Speakers</option>
            <option>Rev. Chijioke Igbani</option>
          </select>
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sermons..."
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
            <h4 className="text-white font-bold text-base mb-0.5">Pastor Chii Daily Podcast</h4>
            <p className="text-blue-200 text-sm">New episode every morning · Rev. Chijioke Igbani · Episode 147 now available</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {sermons.map((sermon) => (
            <div
              key={sermon.title}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className={`bg-gradient-to-br ${sermon.gradient} aspect-video flex items-center justify-center`}>
                <ThumbIcon type={sermon.type} />
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${TYPE_BADGE[sermon.type]}`}>
                  {TYPE_LABEL[sermon.type]}
                </div>
                <h4 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[#1A1A1A] leading-snug mb-1 group-hover:text-[#1E3A8A] transition-colors">
                  {sermon.title}
                </h4>
                <p className="text-gray-400 text-xs">{sermon.meta}</p>
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE */}
        <div className="text-center pb-12">
          <button className="border-2 border-gray-200 hover:border-[#1E3A8A] text-gray-500 hover:text-[#1E3A8A] font-bold px-8 py-3 rounded-full transition-colors duration-200 text-sm">
            Load More Sermons
          </button>
        </div>

      </div>

      <Footer />
    </main>
  )
}
