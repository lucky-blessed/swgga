// src/app/admin/media/page.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  Search, Download, Plus, Loader2, RefreshCw,
  Play, Video, Mic, FileText, Radio,
  ChevronDown, X, ToggleLeft, ToggleRight,
  BookOpen,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useSermons, useCreateSermon, useSyncFromSanity,
  exportSermonsToCSV, CONTENT_TYPE_LABELS,
  type Sermon, type ContentType, type SermonFilters,
  type CreateSermonPayload,
} from '@/hooks/admin/useMedia'
import MediaDrawer from '@/components/admin/media/MediaDrawer'

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTENT_TYPE_OPTIONS: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all',            label: 'All Types'       },
  { value: 'video_youtube',  label: 'YouTube Video'   },
  { value: 'video_facebook', label: 'Facebook Video'  },
  { value: 'audio_s3',       label: 'Audio (S3)'      },
  { value: 'podcast',        label: 'Podcast'         },
  { value: 'notes_pdf',      label: 'PDF Notes'       },
]

const CONTENT_TYPE_ICONS: Record<ContentType, any> = {
  video_youtube:  Play,
  video_facebook: Video,
  audio_s3:       Mic,
  podcast:        Radio,
  notes_pdf:      FileText,
}

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  video_youtube:  'text-red-400 bg-red-400/10 border-red-400/20',
  video_facebook: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  audio_s3:       'text-purple-400 bg-purple-400/10 border-purple-400/20',
  podcast:        'text-green-400 bg-green-400/10 border-green-400/20',
  notes_pdf:      'text-orange-400 bg-orange-400/10 border-orange-400/20',
}

const EMPTY_FORM: CreateSermonPayload = {
  title:            '',
  content_type:     'video_youtube',
  speaker:          'Rev. Chijioke Igbani',
  sermon_date:      new Date().toISOString().split('T')[0],
  video_url:      null,
  audio_url:        null,
  notes_url:        null,
  series:           null,
  topic:            null,
  scripture:        null,
  download_enabled: false,
  ministry_tag:     null,
}

// ─── Content Type Badge ───────────────────────────────────────────────────────

function ContentTypeBadge({ type }: { type: ContentType }) {
  const Icon  = CONTENT_TYPE_ICONS[type]
  const color = CONTENT_TYPE_COLORS[type]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                       border text-xs font-medium ${color}`}>
      <Icon size={10} />
      {CONTENT_TYPE_LABELS[type]}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const { user }    = useAdminUser()
  const canWrite    = ['R01', 'R02', 'R07'].includes(String(user?.role ?? ''))
  const canSync     = canWrite

  // Filters
  const [searchInput,   setSearchInput]   = useState('')
  const [contentType,   setContentType]   = useState<ContentType | 'all'>('all')
  const [speakerFilter, setSpeakerFilter] = useState('all')
  const [page,          setPage]          = useState(1)

  // Drawer
  const [selected, setSelected] = useState<Sermon | null>(null)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState<CreateSermonPayload>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  // Sync feedback
  const [syncMessage, setSyncMessage] = useState('')

  const filters: SermonFilters = {
    search:       searchInput,
    content_type: contentType,
    speaker:      speakerFilter,
    page,
    limit:        20,
  }

  const { data, isLoading, isFetching, refetch } = useSermons(filters)
  const createMutation = useCreateSermon()
  const syncMutation   = useSyncFromSanity()

  const sermons: Sermon[] = data?.sermons ?? []
  const total: number     = data?.total   ?? 0
  const pages: number     = data?.pages   ?? 1

  // Unique speakers for filter dropdown
  const speakers = useMemo(() => {
    const all = sermons.map(s => s.speaker).filter(Boolean)
    return [...new Set(all)].sort()
  }, [sermons])

  const hasActiveFilters = !!(searchInput || contentType !== 'all' || speakerFilter !== 'all')

  // ── Sync handler ───────────────────────────────────────────────────────────

  async function handleSync() {
    setSyncMessage('')
    try {
      const result = await syncMutation.mutateAsync()
      setSyncMessage(`✓ ${result.message}`)
      setTimeout(() => setSyncMessage(''), 5000)
    } catch (e: any) {
      setSyncMessage(`✗ ${e.message}`)
      setTimeout(() => setSyncMessage(''), 5000)
    }
  }

  // ── Create handler ─────────────────────────────────────────────────────────

  async function handleCreate() {
    setFormError('')
    if (!form.title?.trim())   { setFormError('Title is required.');       return }
    if (!form.speaker?.trim()) { setFormError('Speaker is required.');     return }
    if (!form.sermon_date)     { setFormError('Sermon date is required.'); return }

    if (form.content_type === 'video_youtube' && !form.video_url) {
      setFormError('YouTube URL is required for YouTube videos.'); return
    }
    if (form.content_type === 'video_facebook' && !form.video_url) {
      setFormError('Facebook URL is required for Facebook videos.'); return
    }
    if (form.content_type === 'audio_s3' && !form.audio_url) {
      setFormError('Audio URL is required for audio sermons.'); return
    }

    try {
      await createMutation.mutateAsync(form)
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to save sermon.')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Media Library
          </h1>
          <p className="text-[#64748B] text-sm mt-0.5">
            {isLoading ? 'Loading…' : `${total} sermon${total !== 1 ? 's' : ''}`}
            {isFetching && !isLoading && (
              <span className="ml-2 text-[#334155]">· refreshing</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">

          {/* Sync message */}
          {syncMessage && (
            <span className={`text-xs px-3 py-1.5 rounded-xl border
                              ${syncMessage.startsWith('✓')
                                ? 'bg-green-400/10 border-green-400/20 text-green-400'
                                : 'bg-red-400/10 border-red-400/20 text-red-400'
                              }`}>
              {syncMessage}
            </span>
          )}

          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-xl bg-[#0A1628] border border-white/5
                       hover:border-white/15 flex items-center justify-center
                       text-[#64748B] hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => exportSermonsToCSV(sermons)}
            disabled={!sermons.length}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                       text-[#64748B] hover:text-white hover:border-white/20 text-sm
                       transition-colors disabled:opacity-40"
          >
            <Download size={15} /> Export CSV
          </button>

          {canSync && (
            <button
              onClick={handleSync}
              disabled={syncMutation.status === 'pending'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#B8860B]/30
                         bg-[#B8860B]/10 text-[#F5C518] hover:bg-[#B8860B]/20 text-sm
                         transition-colors disabled:opacity-50"
            >
              {syncMutation.status === 'pending'
                ? <><Loader2 size={14} className="animate-spin" /> Syncing...</>
                : <><RefreshCw size={14} /> Sync from Sanity</>
              }
            </button>
          )}

          {canWrite && (
            <button
              onClick={() => { setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A8A]
                         hover:bg-[#1e40af] text-white text-sm transition-colors"
            >
              <Plus size={15} /> Add Sermon
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#334155]" />
          <input
            type="text"
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(1) }}
            placeholder="Search title, speaker, series, topic…"
            className="w-full bg-[#0A1628] border border-white/5 rounded-xl
                       pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[#334155]
                       focus:outline-none focus:border-[#1E3A8A]/50 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#334155] hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={contentType}
            onChange={e => { setContentType(e.target.value as ContentType | 'all'); setPage(1) }}
            className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl
                       pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none
                       focus:border-white/10 cursor-pointer"
          >
            {CONTENT_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>

        {speakers.length > 0 && (
          <div className="relative">
            <select
              value={speakerFilter}
              onChange={e => { setSpeakerFilter(e.target.value); setPage(1) }}
              className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl
                         pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none
                         focus:border-white/10 cursor-pointer"
            >
              <option value="all">All Speakers</option>
              {speakers.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={() => { setSearchInput(''); setContentType('all'); setSpeakerFilter('all'); setPage(1) }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl
                       bg-[#1E3A8A]/15 border border-[#1E3A8A]/20
                       text-[#93C5FD] text-xs font-medium hover:bg-[#1E3A8A]/25 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Title', 'Type', 'Speaker', 'Series', 'Scripture', 'Date', 'Download'].map(h => (
                <th key={h}
                    className="text-left text-xs text-[#64748B] uppercase tracking-wider
                               px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#64748B] mx-auto" />
                </td>
              </tr>
            ) : sermons.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#0F1E35] border border-white/5
                                    flex items-center justify-center">
                      <Play size={24} className="text-[#334155]" />
                    </div>
                    <p className="text-[#64748B] text-sm">No sermons found</p>
                    {canSync && (
                      <button
                        onClick={handleSync}
                        disabled={syncMutation.status === 'pending'}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl
                                   bg-[#B8860B]/10 border border-[#B8860B]/20
                                   text-[#F5C518] text-sm hover:bg-[#B8860B]/20 transition-colors"
                      >
                        <RefreshCw size={14} /> Sync from Sanity
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : sermons.map(s => (
              <tr
                key={s.id}
                onClick={() => setSelected(s)}
                className="border-b border-white/5 hover:bg-[#0F1E35] cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="text-white text-sm font-medium truncate">{s.title}</p>
                  {s.topic && (
                    <p className="text-[#64748B] text-xs truncate">{s.topic}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ContentTypeBadge type={s.content_type} />
                </td>
                <td className="px-4 py-3 text-[#64748B] text-sm">{s.speaker}</td>
                <td className="px-4 py-3 text-[#64748B] text-sm">
                  {s.series ?? <span className="text-[#334155]">—</span>}
                </td>
                <td className="px-4 py-3">
                  {s.scripture ? (
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={11} className="text-[#B8860B] flex-shrink-0" />
                      <span className="text-[#64748B] text-xs truncate max-w-[120px]">
                        {s.scripture}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#334155] text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#64748B] text-sm whitespace-nowrap">
                  {new Date(s.sermon_date).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-3">
                  {s.download_enabled
                    ? <ToggleRight size={18} className="text-green-400" />
                    : <ToggleLeft  size={18} className="text-[#334155]" />
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-[#64748B] text-sm">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-[#64748B]
                           hover:text-white text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-[#64748B]
                           hover:text-white text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <MediaDrawer
        sermon={selected}
        onClose={() => setSelected(null)}
      />

      {/* Add Sermon Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl w-full max-w-lg
                            max-h-[90vh] flex flex-col">

              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-semibold">Add Sermon</h2>
                <button onClick={() => setShowModal(false)}
                        className="text-[#64748B] hover:text-white">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                                  px-4 py-3 text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                               text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                {/* Content Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.content_type}
                      onChange={e => setForm(p => ({
                        ...p, content_type: e.target.value as ContentType
                      }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    >
                      {CONTENT_TYPE_OPTIONS.filter(o => o.value !== 'all').map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.sermon_date}
                      onChange={e => setForm(p => ({ ...p, sermon_date: e.target.value }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>

                {/* Speaker */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">
                    Speaker <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.speaker}
                    onChange={e => setForm(p => ({ ...p, speaker: e.target.value }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                               text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                {/* Media URL — conditional on type */}
                {(form.content_type === 'video_youtube') && (
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      YouTube URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={form.video_url ?? ''}
                      onChange={e => setForm(p => ({ ...p, video_url: e.target.value || null }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                {(form.content_type === 'video_facebook') && (
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Facebook Video URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={form.video_url ?? ''}
                      onChange={e => setForm(p => ({ ...p, video_url: e.target.value || null }))}
                      placeholder="https://facebook.com/video/..."
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                {(form.content_type === 'audio_s3' || form.content_type === 'podcast') && (
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Audio URL {form.content_type === 'audio_s3' && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="url"
                      value={form.audio_url ?? ''}
                      onChange={e => setForm(p => ({ ...p, audio_url: e.target.value || null }))}
                      placeholder="https://..."
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                {form.content_type === 'notes_pdf' && (
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      PDF Notes URL
                    </label>
                    <input
                      type="url"
                      value={form.notes_url ?? ''}
                      onChange={e => setForm(p => ({ ...p, notes_url: e.target.value || null }))}
                      placeholder="https://..."
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                {/* Optional fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">Series</label>
                    <input
                      type="text"
                      value={form.series ?? ''}
                      onChange={e => setForm(p => ({ ...p, series: e.target.value || null }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">Topic</label>
                    <input
                      type="text"
                      value={form.topic ?? ''}
                      onChange={e => setForm(p => ({ ...p, topic: e.target.value || null }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                                 text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Scripture</label>
                  <input
                    type="text"
                    value={form.scripture ?? ''}
                    onChange={e => setForm(p => ({ ...p, scripture: e.target.value || null }))}
                    placeholder="e.g. John 3:16"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                               text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                {/* Download toggle */}
                <div className="flex items-center justify-between bg-[#060E1A]
                                border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm">Enable Download</p>
                    <p className="text-[#334155] text-xs">Allow members to download this sermon</p>
                  </div>
                  <button
                    onClick={() => setForm(p => ({ ...p, download_enabled: !p.download_enabled }))}
                    className={`w-10 h-5 rounded-full transition-colors relative
                                ${form.download_enabled ? 'bg-[#1E3A8A]' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                      transition-transform
                                      ${form.download_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10
                             text-[#64748B] hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.status === 'pending'}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af]
                             text-white font-semibold text-sm transition-colors
                             disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.status === 'pending'
                    ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    : 'Save Sermon'
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}