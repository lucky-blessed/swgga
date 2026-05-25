// src/hooks/admin/useConference.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface MeetingParticipant {
  id:          string
  user_id:     string
  name:        string
  category:    string | null
  notified_at: string | null
  joined_at:   string | null
  left_at:     string | null
  sms_sent:    boolean
}

export interface Meeting {
  id:                string
  title:             string
  scheduled_time:    string
  duration_minutes:  number
  jitsi_room_id:     string | null
  meeting_url:       string | null
  notes:             string | null
  recording_enabled: boolean
  recording_url:     string | null
  status:            MeetingStatus
  created_at:        string
  created_by:        { id: string; name: string }
  participants:      MeetingParticipant[]
}

export interface MeetingFilters {
  filter?: 'upcoming' | 'past' | 'all'
  page?:   number
  limit?:  number
}

export interface CreateMeetingPayload {
  title:              string
  scheduled_time:     string
  duration_minutes?:  number
  recording_enabled?: boolean
  notes?:             string | null
  participant_ids?:   string[]
  category?:          string | null
}

export interface UpdateMeetingPayload {
  title?:             string
  scheduled_time?:    string
  duration_minutes?:  number
  recording_enabled?: boolean
  notes?:             string | null
  status?:            MeetingStatus
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchMeetings(filters: MeetingFilters) {
  const params = new URLSearchParams()
  if (filters.filter) params.set('filter', filters.filter)
  params.set('page',  String(filters.page  ?? 1))
  params.set('limit', String(filters.limit ?? 20))

  const res = await fetch(`/api/v1/admin/conference?${params}`)
  if (!res.ok) throw new Error('Failed to fetch meetings')
  return res.json()
}

async function fetchMeeting(id: string) {
  const res = await fetch(`/api/v1/admin/conference/${id}`)
  if (!res.ok) throw new Error('Failed to fetch meeting')
  return res.json()
}

async function createMeeting(payload: CreateMeetingPayload) {
  const res = await fetch('/api/v1/admin/conference', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to create meeting')
  }
  return res.json()
}

async function updateMeeting({ id, ...payload }: UpdateMeetingPayload & { id: string }) {
  const res = await fetch(`/api/v1/admin/conference/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to update meeting')
  }
  return res.json()
}

async function cancelMeeting(id: string) {
  const res = await fetch(`/api/v1/admin/conference/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to cancel meeting')
  }
  return res.json()
}

async function joinMeeting(id: string) {
  const res = await fetch(`/api/v1/admin/conference/${id}/join`, { method: 'POST' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to join meeting')
  }
  return res.json()
}

async function leaveMeeting(id: string) {
  const res = await fetch(`/api/v1/admin/conference/${id}/join`, { method: 'PATCH' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to record leave')
  }
  return res.json()
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMeetings(filters: MeetingFilters = {}) {
  return useQuery({
    queryKey: ['meetings', filters],
    queryFn:  () => fetchMeetings(filters),
  })
}

export function useMeeting(id: string | null) {
  return useQuery({
    queryKey: ['meeting', id],
    queryFn:  () => fetchMeeting(id!),
    enabled:  !!id,
    refetchInterval: 30000, // Refresh every 30s for live status updates
  })
}

export function useCreateMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMeeting,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.id] })
    },
  })
}

export function useCancelMeeting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

export function useJoinMeeting() {
  return useMutation({ mutationFn: joinMeeting })
}

export function useLeaveMeeting() {
  return useMutation({ mutationFn: leaveMeeting })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatMeetingTime(scheduled_time: string): string {
  return new Date(scheduled_time).toLocaleString('en-GB', {
    weekday: 'short',
    day:     '2-digit',
    month:   'short',
    year:    'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
    timeZone: 'Africa/Lagos', // WAT
  })
}

export function getMeetingDuration(start: string, duration_minutes: number): string {
  const end = new Date(new Date(start).getTime() + duration_minutes * 60000)
  return end.toLocaleTimeString('en-GB', {
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'Africa/Lagos',
  })
}

export const STATUS_CONFIG: Record<MeetingStatus, {
  label: string; color: string; bg: string; dot: string
}> = {
  scheduled:   { label: 'Scheduled',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',   dot: 'bg-blue-400'   },
  in_progress: { label: 'Live Now',    color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20', dot: 'bg-green-400 animate-pulse'  },
  completed:   { label: 'Completed',   color: 'text-[#64748B]',  bg: 'bg-white/5 border-white/10',          dot: 'bg-[#64748B]'  },
  cancelled:   { label: 'Cancelled',   color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',     dot: 'bg-red-400'    },
}