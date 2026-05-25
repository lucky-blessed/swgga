// src/hooks/admin/useMedia.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentType =
  | 'video_youtube'
  | 'video_facebook'
  | 'audio_s3'
  | 'podcast'
  | 'notes_pdf'

export interface Sermon {
  id:               string
  sanity_id:        string
  title:            string
  content_type:     ContentType
  video_url:      string | null
  audio_url:        string | null
  notes_url:        string | null
  speaker:          string
  series:           string | null
  topic:            string | null
  scripture:        string | null
  sermon_date:      string
  download_enabled: boolean
  ministry_tag:     string | null
  created_at:       string
  ministries:       { id: string; name: string; slug: string } | null
}

export interface SermonFilters {
  search?:       string
  content_type?: ContentType | 'all'
  speaker?:      string
  series?:       string
  page?:         number
  limit?:        number
}

export interface CreateSermonPayload {
  title:            string
  content_type:     ContentType
  video_url?:     string | null
  audio_url?:       string | null
  notes_url?:       string | null
  speaker:          string
  series?:          string | null
  topic?:           string | null
  scripture?:       string | null
  sermon_date:      string
  download_enabled?: boolean
  ministry_tag?:    string | null
  sanity_id?:       string
}

export interface UpdateSermonPayload extends Partial<CreateSermonPayload> {}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchSermons(filters: SermonFilters) {
  const params = new URLSearchParams()
  if (filters.search)                              params.set('search',       filters.search)
  if (filters.content_type && filters.content_type !== 'all')
                                                   params.set('content_type', filters.content_type)
  if (filters.speaker && filters.speaker !== 'all') params.set('speaker',    filters.speaker)
  if (filters.series)                              params.set('series',       filters.series)
  params.set('page',  String(filters.page  ?? 1))
  params.set('limit', String(filters.limit ?? 20))

  const res = await fetch(`/api/v1/admin/media?${params}`)
  if (!res.ok) throw new Error('Failed to fetch sermons')
  return res.json()
}

async function fetchSermon(id: string) {
  const res = await fetch(`/api/v1/admin/media/${id}`)
  if (!res.ok) throw new Error('Failed to fetch sermon')
  return res.json()
}

async function createSermon(payload: CreateSermonPayload) {
  const res = await fetch('/api/v1/admin/media', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to create sermon')
  }
  return res.json()
}

async function updateSermon({ id, ...payload }: UpdateSermonPayload & { id: string }) {
  const res = await fetch(`/api/v1/admin/media/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to update sermon')
  }
  return res.json()
}

async function deleteSermon(id: string) {
  const res = await fetch(`/api/v1/admin/media/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to delete sermon')
  }
  return res.json()
}

async function syncFromSanity() {
  const res = await fetch('/api/v1/admin/media/sync', { method: 'POST' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Sync failed')
  }
  return res.json()
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSermons(filters: SermonFilters = {}) {
  return useQuery({
    queryKey: ['sermons', filters],
    queryFn:  () => fetchSermons(filters),
  })
}

export function useSermon(id: string | null) {
  return useQuery({
    queryKey: ['sermon', id],
    queryFn:  () => fetchSermon(id!),
    enabled:  !!id,
  })
}

export function useCreateSermon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
    },
  })
}

export function useUpdateSermon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSermon,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      queryClient.invalidateQueries({ queryKey: ['sermon', variables.id] })
    },
  })
}

export function useDeleteSermon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
    },
  })
}

export function useSyncFromSanity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: syncFromSanity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
    },
  })
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video_youtube:  'YouTube Video',
  video_facebook: 'Facebook Video',
  audio_s3:       'Audio (S3)',
  podcast:        'Podcast',
  notes_pdf:      'PDF Notes',
}

export function exportSermonsToCSV(sermons: Sermon[]) {
  const headers = [
    'Title', 'Speaker', 'Type', 'Series', 'Topic',
    'Scripture', 'Date', 'Ministry', 'Download Enabled',
  ]

  const rows = sermons.map(s => [
    s.title,
    s.speaker,
    CONTENT_TYPE_LABELS[s.content_type] ?? s.content_type,
    s.series          ?? '',
    s.topic           ?? '',
    s.scripture       ?? '',
    s.sermon_date,
    s.ministries?.name ?? '',
    s.download_enabled ? 'Yes' : 'No',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `swgga-media-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}