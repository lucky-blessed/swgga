// src/app/admin/prayer/page.tsx
'use client'

import { useState } from 'react'
import {
  RefreshCw, Loader2, Filter,
  Lock, AlertTriangle, CheckCircle2,
  ChevronDown, X, Users,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  usePrayerRequests, useUpdatePrayer, useBulkUpdatePrayer,
  STATUS_CONFIG, SOURCE_LABELS,
  type PrayerRequest, type PrayerFilters,
  type PrayerStatus, type PrayerSource,
} from '@/hooks/admin/usePrayer'

// ─── Constants ------------------------------------------------

const STATUS_TABS: { value: PrayerStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All'        },
  { value: 'new',         label: 'New'        },
  { value: 'in_progress', label: 'In Prayer'  },
  { value: 'prayed_for',  label: 'Prayed For' },
  { value: 'resolved',    label: 'Resolved'   },
]

const SOURCE_OPTIONS: { value: PrayerSource | 'all'; label: string }[] = [
  { value: 'all',             label: 'All Sources'     },
  { value: 'public',          label: 'Public'          },
  { value: 'portal',          label: 'Member Portal'   },
  { value: 'prayer_connect',  label: 'Prayer Connect'  },
  { value: 'healing_streams', label: 'Healing Streams' },
]

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({
  request,
  isSelected,
  onSelect,
  onOpen,
  canAdmin,
}: {
  request:   PrayerRequest
  isSelected: boolean
  onSelect:  (id: string, checked: boolean) => void
  onOpen:    (r: PrayerRequest) => void
  canAdmin:  boolean
}) {
  const cfg     = STATUS_CONFIG[request.status]
  const isUrgent = request.urgency === 'urgent'

  return (
    <div
      onClick={() => onOpen(request)}
      className={`bg-[#0A1628] border rounded-2xl p-4 cursor-pointer
                  transition-all duration-200 hover:border-white/10
                  hover:bg-[#0F1E35] group
                  ${isUrgent
                    ? 'border-red-400/30 shadow-[0_0_12px_rgba(248,113,113,0.05)]'
                    : isSelected
                    ? 'border-[#1E3A8A]/50'
                    : 'border-white/5'
                  }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {canAdmin && (
          <div
            className="flex-shrink-0 mt-0.5"
            onClick={e => { e.stopPropagation(); onSelect(request.id, !isSelected) }}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center
                              transition-colors cursor-pointer
                              ${isSelected
                                ? 'bg-[#1E3A8A] border-[#1E3A8A]'
                                : 'border-white/10 hover:border-white/30'
                              }`}>
              {isSelected && (
                <svg className="w-2.5 h-2.5 text-white" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5
                              rounded-full border text-xs font-bold
                              ${cfg.bg} ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>

            {/* Urgent badge */}
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               border bg-red-400/10 border-red-400/20 text-red-400
                               text-xs font-bold">
                <AlertTriangle size={9} /> Urgent
              </span>
            )}

            {/* Private badge */}
            {request.keep_private && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               border bg-[#B8860B]/10 border-[#B8860B]/20 text-[#F5C518]
                               text-xs font-bold">
                <Lock size={9} /> Private
              </span>
            )}

            {/* Source */}
            <span className="text-[#334155] text-xs ml-auto">
              {SOURCE_LABELS[request.source as PrayerSource] ?? request.source}
            </span>
          </div>

          {/* Requester */}
          <p className="text-white text-sm font-medium truncate">
            {request.requester_name}
          </p>
          {request.requester_contact && (
            <p className="text-[#64748B] text-xs">{request.requester_contact}</p>
          )}
        </div>
      </div>

      {/* Content preview */}
      <p className="text-[#64748B] text-sm leading-relaxed line-clamp-3 mb-3">
        {request.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[#334155] text-xs">
          {new Date(request.created_at).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            timeZone: 'Africa/Lagos',
          })}
        </span>
        {request.assigned_to && (
          <span className="text-[#64748B] text-xs">
            → {request.assigned_to.name.split(' ')[0]}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Request Detail Modal ─────────────────────────────────────────────────────

function RequestModal({
  request,
  onClose,
  canAdmin,
}: {
  request:  PrayerRequest
  onClose:  () => void
  canAdmin: boolean
}) {
  const updateMutation = useUpdatePrayer()
  const cfg            = STATUS_CONFIG[request.status]
  const [error, setError] = useState('')

  async function handleStatus(status: PrayerStatus) {
    setError('')
    try {
      await updateMutation.mutateAsync({ id: request.id, status })
      onClose()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const nextStatuses: PrayerStatus[] = (['new', 'in_progress', 'prayed_for', 'resolved'] as PrayerStatus[])
    .filter(s => s !== request.status)

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl
                        w-full max-w-lg max-h-[90vh] flex flex-col">

          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                rounded-full border text-xs font-bold
                                ${cfg.bg} ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
              {request.urgency === 'urgent' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                 border bg-red-400/10 border-red-400/20 text-red-400
                                 text-xs font-bold">
                  <AlertTriangle size={9} /> Urgent
                </span>
              )}
              {request.keep_private && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                 border bg-[#B8860B]/10 border-[#B8860B]/20 text-[#F5C518]
                                 text-xs font-bold">
                  <Lock size={9} /> Private
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-[#64748B] hover:text-white">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                              px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Requester info */}
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">
                From
              </p>
              <p className="text-white font-medium">{request.requester_name}</p>
              {request.requester_contact && (
                <p className="text-[#64748B] text-sm">{request.requester_contact}</p>
              )}
              <p className="text-[#334155] text-xs mt-1">
                Via {SOURCE_LABELS[request.source as PrayerSource] ?? request.source}
                {' · '}
                {new Date(request.created_at).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                  timeZone: 'Africa/Lagos',
                })}
              </p>
            </div>

            {/* Prayer content */}
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">
                Prayer Request
              </p>
              <div className="bg-[#060E1A] border border-white/5 rounded-xl p-4">
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {request.content}
                </p>
              </div>
            </div>

            {/* Assigned to */}
            {request.assigned_to && (
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">
                  Assigned To
                </p>
                <p className="text-white text-sm">{request.assigned_to.name}</p>
              </div>
            )}

            {/* Resolved at */}
            {request.resolved_at && (
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">
                  Resolved
                </p>
                <p className="text-white text-sm">
                  {new Date(request.resolved_at).toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                    timeZone: 'Africa/Lagos',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Status actions */}
          {canAdmin && request.status !== 'resolved' && (
            <div className="px-6 py-4 border-t border-white/5 space-y-2">
              <p className="text-xs text-[#64748B] mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map(s => {
                  const c = STATUS_CONFIG[s]
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      disabled={updateMutation.status === 'pending'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                  border text-xs font-bold transition-colors
                                  disabled:opacity-50 ${c.bg} ${c.color}`}
                    >
                      {updateMutation.status === 'pending'
                        ? <Loader2 size={11} className="animate-spin" />
                        : <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      }
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main Page ------------------------------------------------

export default function PrayerQueuePage() {
  const { user }    = useAdminUser()
  const canAdmin    = ['R01', 'R02'].includes(String(user?.role ?? ''))
  const canUpdate   = ['R01', 'R02', 'R08'].includes(String(user?.role ?? ''))

  // Filters
  const [statusFilter, setStatusFilter] = useState<PrayerStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<PrayerSource | 'all'>('all')
  const [urgencyOnly,  setUrgencyOnly]  = useState(false)
  const [page,         setPage]         = useState(1)

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Detail modal
  const [detailRequest, setDetailRequest] = useState<PrayerRequest | null>(null)

  const filters: PrayerFilters = {
    status:  statusFilter,
    source:  sourceFilter,
    urgency: urgencyOnly ? 'urgent' : 'all',
    page,
    limit:   20,
  }

  const { data, isLoading, isFetching, refetch } = usePrayerRequests(filters)
  const bulkMutation = useBulkUpdatePrayer()

  const requests: PrayerRequest[] = data?.requests ?? []
  const total: number             = data?.total    ?? 0
  const pages: number             = data?.pages    ?? 1

  const urgentCount = requests.filter(r => r.urgency === 'urgent' && r.status !== 'resolved').length
  const newCount    = requests.filter(r => r.status === 'new').length

  function toggleSelect(id: string, checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  async function handleBulkStatus(status: PrayerStatus) {
    if (selected.size === 0) return
    await bulkMutation.mutateAsync({
      ids: Array.from(selected),
      status,
    })
    setSelected(new Set())
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            Prayer Queue
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[#64748B] text-sm">
              {isLoading ? 'Loading…' : `${total} request${total !== 1 ? 's' : ''}`}
            </p>
            {urgentCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               border bg-red-400/10 border-red-400/20 text-red-400
                               text-xs font-bold">
                <AlertTriangle size={9} /> {urgentCount} urgent
              </span>
            )}
            {newCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               border bg-blue-400/10 border-blue-400/20 text-blue-400
                               text-xs font-bold">
                {newCount} new
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 rounded-xl bg-[#0A1628] border border-white/5
                     hover:border-white/15 flex items-center justify-center
                     text-[#64748B] hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Status tabs */}
        <div className="flex items-center bg-[#0A1628] border border-white/5 rounded-xl p-1">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => { setStatusFilter(t.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                          ${statusFilter === t.value
                            ? 'bg-[#1E3A8A] text-white'
                            : 'text-[#64748B] hover:text-white'
                          }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Source filter */}
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={e => { setSourceFilter(e.target.value as PrayerSource | 'all'); setPage(1) }}
            className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl
                       pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none
                       focus:border-white/10 cursor-pointer"
          >
            {SOURCE_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2
                       text-[#64748B] pointer-events-none" />
        </div>

        {/* Urgent toggle */}
        <button
          onClick={() => { setUrgencyOnly(p => !p); setPage(1) }}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs
                      font-medium transition-colors
                      ${urgencyOnly
                        ? 'bg-red-400/10 border-red-400/20 text-red-400'
                        : 'bg-[#0A1628] border-white/5 text-[#64748B] hover:text-white'
                      }`}
        >
          <AlertTriangle size={12} /> Urgent Only
        </button>

        {(statusFilter !== 'all' || sourceFilter !== 'all' || urgencyOnly) && (
          <button
            onClick={() => {
              setStatusFilter('all')
              setSourceFilter('all')
              setUrgencyOnly(false)
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

      {/* Bulk actions */}
      {selected.size > 0 && canAdmin && (
        <div className="flex items-center justify-between px-4 py-2.5
                        bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 rounded-xl">
          <span className="text-[#93C5FD] text-xs font-bold">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            {(['in_progress', 'prayed_for', 'resolved'] as PrayerStatus[]).map(s => {
              const c = STATUS_CONFIG[s]
              return (
                <button
                  key={s}
                  onClick={() => handleBulkStatus(s)}
                  disabled={bulkMutation.status === 'pending'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border
                              text-xs font-bold transition-colors disabled:opacity-50
                              ${c.bg} ${c.color}`}
                >
                  {c.label}
                </button>
              )
            })}
            <button
              onClick={() => setSelected(new Set())}
              className="text-[#64748B] hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Request grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#64748B]" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0A1628] border border-white/5
                          flex items-center justify-center">
            <CheckCircle2 size={24} className="text-[#334155]" />
          </div>
          <p className="text-[#64748B] text-sm">No prayer requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {requests.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              isSelected={selected.has(r.id)}
              onSelect={toggleSelect}
              onOpen={setDetailRequest}
              canAdmin={canAdmin}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Detail modal */}
      {detailRequest && (
        <RequestModal
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
          canAdmin={canUpdate}
        />
      )}
    </div>
  )
}