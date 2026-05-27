// src/app/portal/prayer/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrayerRequest {
  id:           string
  content:      string
  urgency:      'normal' | 'urgent'
  keep_private: boolean
  status:       'new' | 'in_progress' | 'prayed_for' | 'resolved'
  created_at:   string
  resolved_at:  string | null
}

interface PrayerResponse {
  requests: PrayerRequest[]
  total:    number
  page:     number
  limit:    number
  pages:    number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all',         label: 'All'         },
  { value: 'new',         label: 'New'         },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'prayed_for',  label: 'Prayed For'  },
  { value: 'resolved',    label: 'Resolved'    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string): string {
  switch (status) {
    case 'new':         return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'in_progress': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    case 'prayed_for':  return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    case 'resolved':    return 'text-green-400 bg-green-400/10 border-green-400/20'
    default:            return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}

function statusLabel(status: string): string {
  return STATUS_OPTIONS.find(s => s.value === status)?.label ?? status
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortalPrayerPage() {
  // Form state
  const [content,     setContent]     = useState('')
  const [urgency,     setUrgency]     = useState<'normal' | 'urgent'>('normal')
  const [keepPrivate, setKeepPrivate] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitOk,    setSubmitOk]    = useState(false)

  // List state
  const [statusFilter, setStatusFilter] = useState('all')
  const [page,         setPage]         = useState(1)
  const [data,         setData]         = useState<PrayerResponse | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [listError,    setListError]    = useState('')

  // ── Fetch list ─────────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setListError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/v1/prayer?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load prayer requests')
      setData(await res.json())
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { setPage(1) }, [statusFilter])
  useEffect(() => { fetchRequests() }, [fetchRequests])

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitError('')
    setSubmitOk(false)

    if (!content.trim()) {
      setSubmitError('Please write your prayer request.')
      return
    }
    if (content.trim().length < 10) {
      setSubmitError('Please provide a bit more detail.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/prayer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content, urgency, keep_private: keepPrivate }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to submit')
      }

      // Reset form
      setContent('')
      setUrgency('normal')
      setKeepPrivate(false)
      setSubmitOk(true)

      // Refresh list
      setPage(1)
      fetchRequests()

      // Clear success message after 5s
      setTimeout(() => setSubmitOk(false), 5000)

    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-playfair">Prayer Requests</h1>
        <p className="text-sm text-gray-400 mt-1">
          Submit a prayer request and our team will pray with you.
        </p>
      </div>

      {/* Submit Form */}
      <div className="bg-[#0A1628] border border-white/5 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">New Prayer Request</h2>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400">
            Your request <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share what you would like us to pray about…"
            rows={4}
            className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-4 py-3
                       text-sm text-white placeholder:text-gray-600 resize-none
                       focus:outline-none focus:border-[#B8860B] transition-colors"
          />
          <p className="text-xs text-gray-600 text-right">{content.length} characters</p>
        </div>

        {/* Urgency + Privacy row */}
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Urgency */}
          <div className="space-y-1.5 flex-1">
            <label className="text-xs text-gray-400">Urgency</label>
            <div className="flex gap-2">
              {(['normal', 'urgent'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors
                    ${urgency === u
                      ? u === 'urgent'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-[#1E3A8A]/40 text-blue-300 border-[#1E3A8A]/60'
                      : 'bg-transparent text-gray-500 border-white/10 hover:border-white/20'
                    }`}
                >
                  {u === 'urgent' ? 'Urgent' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-1.5 flex-1">
            <label className="text-xs text-gray-400">Privacy</label>
            <button
              onClick={() => setKeepPrivate(p => !p)}
              className={`w-full py-2 rounded-lg text-xs font-medium border transition-colors
                ${keepPrivate
                  ? 'bg-[#B8860B]/20 text-[#F5C518] border-[#B8860B]/40'
                  : 'bg-transparent text-gray-500 border-white/10 hover:border-white/20'
                }`}
            >
              {keepPrivate ? 'Private — Pastor only' : 'Not private'}
            </button>
          </div>
        </div>

        {/* Feedback */}
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-xs text-red-400">
            {submitError}
          </div>
        )}
        {submitOk && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-xs text-green-400">
            Your prayer request has been submitted. We are praying with you.
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                     bg-[#B8860B] hover:bg-[#B8860B]/80 text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Prayer Request'}
        </button>
      </div>

      {/* Request History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">My Requests</h2>

          {/* Status filter tabs */}
          <div className="flex gap-1 flex-wrap justify-end">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1 rounded-full text-xs transition-colors
                  ${statusFilter === s.value
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {listError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
            {listError}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#0A1628] border border-white/5 rounded-xl p-5 animate-pulse space-y-3">
                <div className="h-3 bg-white/5 rounded w-1/4" />
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !listError && data?.requests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">
              {statusFilter === 'all'
                ? 'You have not submitted any prayer requests yet.'
                : `No ${statusLabel(statusFilter).toLowerCase()} requests.`}
            </p>
          </div>
        )}

        {/* Request cards */}
        {!loading && !listError && data && data.requests.length > 0 && (
          <>
            <div className="space-y-3">
              {data.requests.map(req => (
                <div
                  key={req.id}
                  className="bg-[#0A1628] border border-white/5 rounded-xl p-5 space-y-3
                             hover:bg-[#0F1E35] transition-colors"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor(req.status)}`}>
                        {statusLabel(req.status)}
                      </span>
                      {req.urgency === 'urgent' && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full border
                                         text-red-400 bg-red-400/10 border-red-400/20">
                          Urgent
                        </span>
                      )}
                      {req.keep_private && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full border
                                         text-[#F5C518] bg-[#B8860B]/10 border-[#B8860B]/20">
                          Private
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(req.created_at)}</span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-300 leading-relaxed">{req.content}</p>

                  {/* Resolved date */}
                  {req.resolved_at && (
                    <p className="text-xs text-green-400">
                      Resolved on {formatDate(req.resolved_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500">
                  Page {data.page} of {data.pages} · {data.total} requests
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
    </div>
  )
}