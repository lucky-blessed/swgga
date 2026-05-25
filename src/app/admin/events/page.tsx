// src/app/admin/events/page.tsx
'use client'

import { useState } from 'react'
import {
  Search, Download, Plus, Loader2, RefreshCw,
  Calendar, MapPin, Users, ChevronDown,
  X, CheckCircle2, Clock,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useEvents, useCreateEvent, exportEventsToCSV,
  formatEventTime, isEventUpcoming,
  type AdminEvent, type EventFilters, type CreateEventPayload,
} from '@/hooks/admin/useEvents'
import EventDrawer from '@/components/admin/events/EventDrawer'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateEventPayload = {
  title:                '',
  description:          null,
  ministry_id:          null,
  start_time:           '',
  end_time:             null,
  location:             null,
  members_only:         false,
  registration_enabled: true,
  is_recurring:         false,
  recurrence_pattern:   null,
  is_cty_event:         false,
  image_url:            null,
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventRow({
  event,
  onClick,
}: {
  event:   AdminEvent
  onClick: () => void
}) {
  const upcoming = isEventUpcoming(event.start_time)

  return (
    <tr
      onClick={onClick}
      className="border-b border-white/5 hover:bg-[#0F1E35] cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-10 h-10 rounded-lg object-cover border border-white/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#0F1E35] border border-white/5
                          flex items-center justify-center">
            <Calendar size={14} className="text-[#334155]" />
          </div>
        )}
      </td>
      <td className="px-4 py-3 max-w-[220px]">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-medium truncate">{event.title}</p>
          {event.is_cty_event && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-bold
                             bg-green-400/10 border-green-400/20 text-green-400
                             flex-shrink-0">
              CTY
            </span>
          )}
          {event.is_recurring && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-bold
                             bg-purple-400/10 border-purple-400/20 text-purple-400
                             flex-shrink-0">
              ↻
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-[#64748B] text-xs truncate mt-0.5">{event.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
          <Calendar size={11} className="flex-shrink-0" />
          <span className="whitespace-nowrap">
            {new Date(event.start_time).toLocaleString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
              timeZone: 'Africa/Lagos',
            })}
          </span>
        </div>
        {event.end_time && (
          <div className="flex items-center gap-1.5 text-[#334155] text-xs mt-0.5">
            <Clock size={11} className="flex-shrink-0" />
            <span>
              Ends {new Date(event.end_time).toLocaleTimeString('en-GB', {
                hour: '2-digit', minute: '2-digit',
                timeZone: 'Africa/Lagos',
              })} WAT
            </span>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {event.location ? (
          <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="truncate max-w-[140px]">{event.location}</span>
          </div>
        ) : (
          <span className="text-[#334155] text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-[#64748B] text-sm">
        {event.ministry?.name ?? <span className="text-[#334155]">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
          <Users size={11} />
          <span>{event.registration_count}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                          border text-xs font-bold
                          ${upcoming
                            ? 'bg-blue-400/10 border-blue-400/20 text-blue-400'
                            : 'bg-white/5 border-white/10 text-[#64748B]'
                          }`}>
          {upcoming ? 'Upcoming' : 'Past'}
        </span>
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const { user }   = useAdminUser()
  const canCreate  = ['R01', 'R03', 'R05', 'R06'].includes(String(user?.role ?? ''))

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [filter,      setFilter]      = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [isCty,       setIsCty]       = useState<'all' | 'true' | 'false'>('all')
  const [page,        setPage]        = useState(1)
  const [syncing,     setSyncing]     = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  // Drawer
  const [selected, setSelected] = useState<AdminEvent | null>(null)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState<CreateEventPayload>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const filters: EventFilters = {
    search: searchInput,
    filter,
    is_cty: isCty,
    page,
    limit:  20,
  }

  const { data, isLoading, isFetching, refetch } = useEvents(filters)
  const createMutation = useCreateEvent()

  const events: AdminEvent[] = data?.events ?? []
  const total: number        = data?.total  ?? 0
  const pages: number        = data?.pages  ?? 1

  const hasActiveFilters = !!(searchInput || filter !== 'upcoming' || isCty !== 'all')

  function openModal() {
    const next = new Date()
    next.setDate(next.getDate() + 1)
    next.setHours(9, 0, 0, 0)
    setForm({
      ...EMPTY_FORM,
      start_time: next.toISOString().slice(0, 16),
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleCreate() {
    setFormError('')
    if (!form.title?.trim()) { setFormError('Title is required.');      return }
    if (!form.start_time)    { setFormError('Start time is required.'); return }
    try {
      await createMutation.mutateAsync(form)
      setShowModal(false)
      refetch()
    } catch (e: any) {
      setFormError(e.message ?? 'Failed to create event.')
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Events
          </h1>
          <p className="text-[#64748B] text-sm mt-0.5">
            {isLoading ? 'Loading…' : `${total} event${total !== 1 ? 's' : ''}`}
            {isFetching && !isLoading && (
              <span className="ml-2 text-[#334155]">· refreshing</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-xl bg-[#0A1628] border border-white/5
                       hover:border-white/15 flex items-center justify-center
                       text-[#64748B] hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => exportEventsToCSV(events)}
            disabled={!events.length}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                       text-[#64748B] hover:text-white hover:border-white/20 text-sm
                       transition-colors disabled:opacity-40"
          >
            <Download size={15} /> Export CSV
          </button>
          {syncMessage && (
            <span className={`text-xs px-3 py-1.5 rounded-xl border ${
              syncMessage.startsWith('✓')
                ? 'bg-green-400/10 border-green-400/20 text-green-400'
                : 'bg-red-400/10 border-red-400/20 text-red-400'
            }`}>{syncMessage}</span>
          )}
          {canCreate && (
            <button
              onClick={async () => {
                setSyncing(true); setSyncMessage('')
                try {
                  const res  = await fetch('/api/v1/admin/events/sync', { method: 'POST' })
                  const data = await res.json()
                  setSyncMessage(`✓ ${data.message}`)
                  refetch()
                } catch { setSyncMessage('✗ Sync failed') }
                finally { setSyncing(false); setTimeout(() => setSyncMessage(''), 5000) }
              }}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/10 text-[#F5C518] hover:bg-[#B8860B]/20 text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync from Sanity'}
            </button>
          )}
          {canCreate && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A8A]
                         hover:bg-[#1e40af] text-white text-sm transition-colors"
            >
              <Plus size={15} /> Add Event
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#334155]" />
          <input
            type="text"
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(1) }}
            placeholder="Search events…"
            className="w-full bg-[#0A1628] border border-white/5 rounded-xl
                       pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[#334155]
                       focus:outline-none focus:border-[#1E3A8A]/50 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-[#334155] hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center bg-[#0A1628] border border-white/5 rounded-xl p-1">
          {(['upcoming', 'all', 'past'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                          ${filter === f
                            ? 'bg-[#1E3A8A] text-white'
                            : 'text-[#64748B] hover:text-white'
                          }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* CTY filter */}
        <div className="relative">
          <select
            value={isCty}
            onChange={e => { setIsCty(e.target.value as any); setPage(1) }}
            className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl
                       pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none
                       focus:border-white/10 cursor-pointer"
          >
            <option value="all">All Events</option>
            <option value="false">SWGGA Only</option>
            <option value="true">CTY Only</option>
          </select>
          <ChevronDown size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2
                       text-[#64748B] pointer-events-none" />
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchInput('')
              setFilter('upcoming')
              setIsCty('all')
              setPage(1)
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl
                       bg-[#1E3A8A]/15 border border-[#1E3A8A]/20
                       text-[#93C5FD] text-xs font-medium
                       hover:bg-[#1E3A8A]/25 transition-colors"
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
              {['Flyer', 'Event', 'Date & Time', 'Location', 'Ministry', 'Registered', 'Status'].map(h => (
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
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#0F1E35] border border-white/5
                                    flex items-center justify-center">
                      <Calendar size={24} className="text-[#334155]" />
                    </div>
                    <p className="text-[#64748B] text-sm">No events found</p>
                    {canCreate && (
                      <button
                        onClick={openModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl
                                   bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                                   text-[#93C5FD] text-sm hover:bg-[#1E3A8A]/30
                                   transition-colors"
                      >
                        <Plus size={14} /> Add Event
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : events.map(e => (
              <EventRow
                key={e.id}
                event={e}
                onClick={() => setSelected(e)}
              />
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3
                          border-t border-white/5">
            <p className="text-[#64748B] text-sm">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10
                           text-[#64748B] hover:text-white text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-lg border border-white/10
                           text-[#64748B] hover:text-white text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <EventDrawer
        event={selected}
        onClose={() => setSelected(null)}
      />

      {/* Add Event Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40"
               onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0A1628] border border-white/5 rounded-2xl
                            w-full max-w-lg max-h-[90vh] flex flex-col">

              <div className="flex items-center justify-between px-6 py-4
                              border-b border-white/5">
                <h2 className="text-white font-semibold">Add Event</h2>
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
                    placeholder="e.g. Sunday Service"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description ?? ''}
                    onChange={e => setForm(p => ({
                      ...p, description: e.target.value || null
                    }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A] resize-none"
                  />
                </div>

                {/* Start + End time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">
                      Start Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.start_time}
                      onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={form.end_time ?? ''}
                      onChange={e => setForm(p => ({
                        ...p, end_time: e.target.value || null
                      }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location ?? ''}
                    onChange={e => setForm(p => ({
                      ...p, location: e.target.value || null
                    }))}
                    placeholder="e.g. SWGGA Main Auditorium, Effurun"
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  />
                </div>

                {/* Flyer upload */}
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Event Flyer</label>
                  <div className="flex items-center gap-3">
                    {form.image_url && (
                      <img
                        src={form.image_url}
                        alt="Flyer preview"
                        className="w-16 h-16 rounded-xl object-cover border border-white/10"
                      />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl
                                      bg-[#060E1A] border border-white/10 text-[#64748B]
                                      hover:text-white hover:border-white/20 text-sm
                                      cursor-pointer transition-colors">
                      <Download size={14} />
                      {form.image_url ? 'Change Flyer' : 'Upload Flyer'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const fd = new FormData()
                          fd.append('file', file)
                          const res  = await fetch('/api/v1/admin/events/upload', { method: 'POST', body: fd })
                          const data = await res.json()
                          if (data.url) setForm(p => ({ ...p, image_url: data.url }))
                        }}
                      />
                    </label>
                    {form.image_url && (
                      <button
                        onClick={() => setForm(p => ({ ...p, image_url: null }))}
                        className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  {[
                    { label: 'Members Only',          field: 'members_only',         desc: 'Requires login' },
                    { label: 'Registration Enabled',  field: 'registration_enabled', desc: 'Show register button' },
                    { label: 'CTY Event',             field: 'is_cty_event',         desc: 'Show on CTY calendar' },
                    { label: 'Recurring',             field: 'is_recurring',         desc: 'Repeating event' },
                  ].map(({ label, field, desc }) => (
                    <div key={field}
                         className="flex items-center justify-between bg-[#060E1A]
                                    border border-white/5 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-white text-sm">{label}</p>
                        <p className="text-[#334155] text-xs">{desc}</p>
                      </div>
                      <button
                        onClick={() => setForm(p => ({
                          ...p, [field]: !p[field as keyof CreateEventPayload]
                        }))}
                        className={`w-10 h-5 rounded-full transition-colors relative
                                    ${form[field as keyof CreateEventPayload]
                                      ? 'bg-[#1E3A8A]'
                                      : 'bg-white/10'
                                    }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                          transition-transform
                                          ${form[field as keyof CreateEventPayload]
                                            ? 'translate-x-5'
                                            : 'translate-x-0.5'
                                          }`} />
                      </button>
                    </div>
                  ))}
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
                    : 'Save Event'
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