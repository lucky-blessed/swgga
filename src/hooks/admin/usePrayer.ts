// src/hooks/admin/usePrayer.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types --------------------------------------------------
export type PrayerStatus = 'new' | 'in_progress' | 'prayed_for' | 'resolved'
export type PrayerSource = 'portal' | 'public' | 'prayer_connect' | 'healing_streams'
export type PrayerUrgency = 'normal' | 'urgent'

export interface PrayerRequest {
  id:                string
  requester_name:    string
  requester_contact: string | null
  requester_id:      string | null
  source:            PrayerSource
  content:           string
  urgency:           PrayerUrgency
  keep_private:      boolean
  status:            PrayerStatus
  created_at:        string
  resolved_at:       string | null
  assigned_to:       { id: string; name: string } | null
}

export interface PrayerFilters {
  status?:  PrayerStatus | 'all'
  source?:  PrayerSource | 'all'
  urgency?: PrayerUrgency | 'all'
  page?:    number
  limit?:   number
}

// ─── Status config ----------------------------------------------------
export const STATUS_CONFIG: Record<PrayerStatus, {
  label: string; color: string; bg: string; dot: string
}> = {
  new:         { label: 'New',        color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',     dot: 'bg-blue-400 animate-pulse' },
  in_progress: { label: 'In Prayer',  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
  prayed_for:  { label: 'Prayed For', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  resolved:    { label: 'Resolved',   color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',   dot: 'bg-green-400' },
}

export const SOURCE_LABELS: Record<PrayerSource, string> = {
  portal:         'Member Portal',
  public:         'Public',
  prayer_connect: 'Prayer Connect',
  healing_streams:'Healing Streams',
}

// ─── Fetch helpers ----------------------------------------------------
async function fetchRequests(filters: PrayerFilters) {
  const params = new URLSearchParams()
  if (filters.status  && filters.status  !== 'all') params.set('status',  filters.status)
  if (filters.source  && filters.source  !== 'all') params.set('source',  filters.source)
  if (filters.urgency && filters.urgency !== 'all') params.set('urgency', filters.urgency)
  params.set('page',  String(filters.page  ?? 1))
  params.set('limit', String(filters.limit ?? 20))

  const res = await fetch(`/api/v1/admin/prayer?${params}`)
  if (!res.ok) throw new Error('Failed to fetch prayer requests')
  return res.json()
}

async function fetchRequest(id: string) {
  const res = await fetch(`/api/v1/admin/prayer/${id}`)
  if (!res.ok) throw new Error('Failed to fetch prayer request')
  return res.json()
}

async function updateRequest({
  id, ...payload
}: { id: string; status?: PrayerStatus; assigned_to?: string | null }) {
  const res = await fetch(`/api/v1/admin/prayer/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to update request')
  }
  return res.json()
}

async function bulkUpdateStatus(payload: { ids: string[]; status: PrayerStatus }) {
  const res = await fetch('/api/v1/admin/prayer', {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to bulk update')
  }
  return res.json()
}

// ─── Hooks -----------------

export function usePrayerRequests(filters: PrayerFilters = {}) {
  return useQuery({
    queryKey: ['prayer', filters],
    queryFn:  () => fetchRequests(filters),
    refetchInterval: 60000, // Refresh every 60s for new requests
  })
}

export function usePrayerRequest(id: string | null) {
  return useQuery({
    queryKey: ['prayer-request', id],
    queryFn:  () => fetchRequest(id!),
    enabled:  !!id,
  })
}

export function useUpdatePrayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prayer'] })
      queryClient.invalidateQueries({ queryKey: ['prayer-request', variables.id] })
    },
  })
}

export function useBulkUpdatePrayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer'] })
    },
  })
}