// src/hooks/admin/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventMinistry {
  id:   string
  name: string
  slug: string
}

export interface EventRegistration {
  id:            string
  registered_at: string
  attended:      boolean
  user:          { id: string; name: string }
}

export interface AdminEvent {
  id:                   string
  title:                string
  description:          string | null
  start_time:           string
  end_time:             string | null
  location:             string | null
  members_only:         boolean
  registration_enabled: boolean
  is_recurring:         boolean
  recurrence_pattern:   string | null
  is_cty_event:         boolean
  created_at:           string
  image_url:            string | null
  ministry:             EventMinistry | null
  registration_count:   number
  registrations?:       EventRegistration[]
}

export interface EventFilters {
  search?:   string
  filter?:   'upcoming' | 'past' | 'all'
  ministry?: string
  is_cty?:   'all' | 'true' | 'false'
  page?:     number
  limit?:    number
}

export interface CreateEventPayload {
  title:                string
  description?:         string | null
  ministry_id?:         string | null
  start_time:           string
  end_time?:            string | null
  location?:            string | null
  members_only?:        boolean
  registration_enabled?: boolean
  is_recurring?:        boolean
  recurrence_pattern?:  string | null
  is_cty_event?:        boolean
  image_url?:           string | null
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchEvents(filters: EventFilters) {
  const params = new URLSearchParams()
  if (filters.search)                          params.set('search',   filters.search)
  if (filters.filter)                          params.set('filter',   filters.filter)
  if (filters.ministry && filters.ministry !== 'all')
                                               params.set('ministry', filters.ministry)
  if (filters.is_cty && filters.is_cty !== 'all')
                                               params.set('is_cty',   filters.is_cty)
  params.set('page',  String(filters.page  ?? 1))
  params.set('limit', String(filters.limit ?? 20))

  const res = await fetch(`/api/v1/admin/events?${params}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

async function fetchEvent(id: string) {
  const res = await fetch(`/api/v1/admin/events/${id}`)
  if (!res.ok) throw new Error('Failed to fetch event')
  return res.json()
}

async function createEvent(payload: CreateEventPayload) {
  const res = await fetch('/api/v1/admin/events', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to create event')
  }
  return res.json()
}

async function updateEvent({ id, ...payload }: UpdateEventPayload & { id: string }) {
  const res = await fetch(`/api/v1/admin/events/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to update event')
  }
  return res.json()
}

async function deleteEvent(id: string) {
  const res = await fetch(`/api/v1/admin/events/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to delete event')
  }
  return res.json()
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn:  () => fetchEvents(filters),
  })
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: ['event', id],
    queryFn:  () => fetchEvent(id!),
    enabled:  !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatEventTime(start_time: string, end_time?: string | null): string {
  const start = new Date(start_time).toLocaleString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Lagos',
  })
  if (!end_time) return `${start} WAT`
  const end = new Date(end_time).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Lagos',
  })
  return `${start} – ${end} WAT`
}

export function isEventUpcoming(start_time: string): boolean {
  return new Date(start_time) > new Date()
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportEventsToCSV(events: AdminEvent[]) {
  const headers = [
    'Title', 'Start Time', 'End Time', 'Location',
    'Ministry', 'Members Only', 'Registrations',
    'Recurring', 'CTY Event',
  ]

  const rows = events.map(e => [
    e.title,
    new Date(e.start_time).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }),
    e.end_time
      ? new Date(e.end_time).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })
      : '',
    e.location          ?? '',
    e.ministry?.name    ?? '',
    e.members_only      ? 'Yes' : 'No',
    e.registration_count,
    e.is_recurring      ? 'Yes' : 'No',
    e.is_cty_event      ? 'Yes' : 'No',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `swgga-events-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}