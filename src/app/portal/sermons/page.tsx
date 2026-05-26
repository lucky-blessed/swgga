'use client'

import { useState, useEffect, useCallback } from 'react'

interface Sermon {
  id:               string
  title:            string
  speaker:          string
  series:           string | null
  topic:            string | null
  scripture:        string | null
  content_type:     string
  video_url:        string | null
  audio_url:        string | null
  sermon_date:      string
  download_enabled: boolean
  created_at:       string
}

interface SermonsResponse {
  sermons: Sermon[]
  total:   number
  page:    number
  limit:   number
  pages:   number
}

const CONTENT_TYPE_OPTIONS = [
  { value: '',               label: 'All Types'   },
  { value: 'video_youtube',  label: 'YouTube'     },
  { value: 'video_facebook', label: 'Facebook'    },
  { value: 'audio_s3',       label: 'Audio'       },
  { value: 'podcast',        label: 'Podcast'     },
  { value: 'notes_pdf',      label: 'Notes (PDF)' },
]

const LIMIT = 12

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function contentTypeLabel(type: string): string {
  return CONTENT_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type
}

function contentTypeColor(type: string): string {
  switch (type) {
    case 'video_youtube':  return 'text-red-400 bg-red-400/10'
    case 'video_facebook': return 'text-blue-400 bg-blue-400/10'
    case 'audio_s3':       return 'text-green-400 bg-green-400/10'
    case 'podcast':        return 'text-purple-400 bg-purple-400/10'
    case 'notes_pdf':      return 'text-yellow-400 bg-yellow-400/10'
    default:               return 'text-gray-400 bg-gray-400/10'
  }
}

function primaryUrl(sermon: Sermon): string | null {
  return sermon.video_url ?? sermon.audio_url ?? null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })
}

interface FilterTag {
  label: string
  clear: () => void
}

function buildFilterTags(
  search:         string,
  series:         string,
  speaker:        string,
  contentType:    string,
  setSearch:      (v: string) => void,
  setSeries:      (v: string) => void,
  setSpeaker:     (v: string) => void,
  setContentType: (v: string) => void,
): FilterTag[] {
  const tags: FilterTag[] = []
  if (search)      tags.push({ label: `"${search}"`,                clear: () => setSearch('')       })
  if (series)      tags.push({ label: `Series: ${series}`,          clear: () => setSeries('')       })
  if (speaker)     tags.push({ label: `Speaker: ${speaker}`,        clear: () => setSpeaker('')      })
  if (contentType) tags.push({ label: contentTypeLabel(contentType), clear: () => setContentType('') })
  return tags
}

export default function PortalSermonsPage() {
  const [search,      setSearch]      = useState('')
  const [series,      setSeries]      = useState('')
  const [speaker,     setSpeaker]     = useState('')
  const [contentType, setContentType] = useState('')
  const [page,        setPage]        = useState(1)
  const [data,        setData]        = useState<SermonsResponse | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  const debouncedSearch  = useDebounce(search,  400)
  const debouncedSeries  = useDebounce(series,  400)
  const debouncedSpeaker = useDebounce(speaker, 400)

  const clearAll = () => { setSearch(''); setSeries(''); setSpeaker(''); setContentType('') }

  const fetchSermons = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (debouncedSearch)  params.set('search',       debouncedSearch)
      if (debouncedSeries)  params.set('series',       debouncedSeries)
      if (debouncedSpeaker) params.set('speaker',      debouncedSpeaker)
      if (contentType)      params.set('content_type', contentType)
      const res = await fetch(`/api/v1/sermons?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load sermons')
      setData(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, debouncedSeries, debouncedSpeaker, contentType])

  useEffect(() => { setPage(1) }, [debouncedSearch, debouncedSeries, debouncedSpeaker, contentType])
  useEffect(() => { fetchSermons() }, [fetchSermons])

  const hasFilters = !!(search || series || speaker || contentType)
  const filterTags = buildFilterTags(search, series, speaker, contentType, setSearch, setSeries, setSpeaker, setContentType)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white font-playfair">Sermon Library</h1>
        <p className="text-sm text-gray-400 mt-1">
          {data
            ? `${data.total.toLocaleString()} sermon${data.total !== 1 ? 's' : ''} available`
            : 'Loading…'}
        </p>
      </div>

      <div className="bg-[#0A1628] border border-white/5 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-400">Filter Sermons</p>

        <input
          type="text"
          placeholder="Search by title, topic, or scripture…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-4 py-2.5
                     text-sm text-white placeholder:text-gray-600
                     focus:outline-none focus:border-[#B8860B] transition-colors"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={contentType}
            onChange={e => setContentType(e.target.value)}
            className="bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                       text-sm text-white focus:outline-none focus:border-[#B8860B] transition-colors"
          >
            {CONTENT_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by series…"
            value={series}
            onChange={e => setSeries(e.target.value)}
            className="bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                       text-sm text-white placeholder:text-gray-600
                       focus:outline-none focus:border-[#B8860B] transition-colors"
          />

          <input
            type="text"
            placeholder="Filter by speaker…"
            value={speaker}
            onChange={e => setSpeaker(e.target.value)}
            className="bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                       text-sm text-white placeholder:text-gray-600
                       focus:outline-none focus:border-[#B8860B] transition-colors"
          />
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {filterTags.map((tag, i) => (
              <button
                key={i}
                onClick={tag.clear}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                           bg-[#1E3A8A]/40 text-blue-300 border border-[#1E3A8A]/60
                           hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40
                           transition-colors"
              >
                {tag.label} x
              </button>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="bg-[#0A1628] border border-white/5 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && data?.sermons.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm">No sermons found for your search.</p>
          <button onClick={clearAll} className="mt-3 text-xs text-[#B8860B] hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && data && data.sermons.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sermons.map(sermon => {
              const url = primaryUrl(sermon)
              return (
                <div
                  key={sermon.id}
                  className="bg-[#0A1628] border border-white/5 rounded-xl p-5
                             hover:bg-[#0F1E35] hover:border-white/10 transition-all
                             flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${contentTypeColor(sermon.content_type)}`}>
                      {contentTypeLabel(sermon.content_type)}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(sermon.sermon_date)}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-snug font-playfair line-clamp-2">
                    {sermon.title}
                  </h3>

                  <div className="space-y-1 text-xs text-gray-400 flex-1">
                    <p><span className="text-gray-600">Speaker:</span> {sermon.speaker}</p>
                    {sermon.series    && <p><span className="text-gray-600">Series:</span>    {sermon.series}</p>}
                    {sermon.topic     && <p><span className="text-gray-600">Topic:</span>     {sermon.topic}</p>}
                    {sermon.scripture && <p><span className="text-gray-600">Scripture:</span> {sermon.scripture}</p>}
                  </div>

                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 mt-1
                                 bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white
                                 text-xs font-medium py-2 rounded-lg transition-colors"
                    >
                      {sermon.content_type.startsWith('video') ? 'Watch Sermon' : 'Listen / Read'}
                    </a>
                  ) : (
                    <div className="flex items-center justify-center mt-1
                                    bg-white/5 text-gray-500 text-xs py-2 rounded-lg">
                      No media available
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                Page {data.page} of {data.pages} · {data.total} sermons
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs
                             hover:bg-[#0F1E35] disabled:opacity-30 disabled:cursor-not-allowed
                             transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs
                             hover:bg-[#0F1E35] disabled:opacity-30 disabled:cursor-not-allowed
                             transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
