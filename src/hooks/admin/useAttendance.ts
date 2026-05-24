// src/hooks/admin/useAttendance.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceType = 'sunday_first' | 'sunday_second' | 'wednesday' | 'special'

export interface ServiceRecord {
  id:             string
  service_date:   string
  service_type:   ServiceType
  total_count:    number
  men_count:      number | null
  women_count:    number | null
  children_count: number | null
  first_timers:   number
  notes:          string | null
  event_id:       string | null
  created_at:     string
  recorded_by:    { id: string; name: string }
}

export interface ServiceRecordFilters {
  from?:  string
  to?:    string
  type?:  ServiceType | 'all'
  page?:  number
  limit?: number
}

export interface CreateServiceRecordPayload {
  service_date:    string
  service_type:    ServiceType
  total_count:     number
  men_count?:      number | null
  women_count?:    number | null
  children_count?: number | null
  first_timers?:   number
  notes?:          string | null
  event_id?:       string | null
}

export interface UpdateServiceRecordPayload extends Partial<CreateServiceRecordPayload> {}

// ─── Service Records ──────────────────────────────────────────────────────────

async function fetchServiceRecords(filters: ServiceRecordFilters) {
  const params = new URLSearchParams()
  if (filters.from)              params.set('from',  filters.from)
  if (filters.to)                params.set('to',    filters.to)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  params.set('page',  String(filters.page  ?? 1))
  params.set('limit', String(filters.limit ?? 20))

  const res = await fetch(`/api/v1/admin/attendance/service?${params}`)
  if (!res.ok) throw new Error('Failed to fetch service records')
  return res.json()
}

async function fetchServiceRecord(id: string) {
  const res = await fetch(`/api/v1/admin/attendance/service/${id}`)
  if (!res.ok) throw new Error('Failed to fetch service record')
  return res.json()
}

async function createServiceRecord(payload: CreateServiceRecordPayload) {
  const res = await fetch('/api/v1/admin/attendance/service', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to save service record')
  }
  return res.json()
}

async function updateServiceRecord({ id, ...payload }: UpdateServiceRecordPayload & { id: string }) {
  const res = await fetch(`/api/v1/admin/attendance/service/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to update service record')
  }
  return res.json()
}

export function useServiceRecords(filters: ServiceRecordFilters = {}) {
  return useQuery({
    queryKey: ['service-records', filters],
    queryFn:  () => fetchServiceRecords(filters),
  })
}

export function useServiceRecord(id: string | null) {
  return useQuery({
    queryKey: ['service-record', id],
    queryFn:  () => fetchServiceRecord(id!),
    enabled:  !!id,
  })
}

export function useCreateServiceRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createServiceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] })
    },
  })
}

export function useUpdateServiceRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateServiceRecord,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] })
      queryClient.invalidateQueries({ queryKey: ['service-record', variables.id] })
    },
  })
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportServiceRecordsToCSV(records: ServiceRecord[]) {
  const SERVICE_LABEL: Record<ServiceType, string> = {
    sunday_first:  'Sunday 1st Service',
    sunday_second: 'Sunday 2nd Service',
    wednesday:     'Wednesday Service',
    special:       'Special Service',
  }

  const headers = [
    'Date', 'Service', 'Total', 'Men', 'Women', 'Children', 'First Timers', 'Notes', 'Recorded By'
  ]

  const rows = records.map(r => [
    r.service_date,
    SERVICE_LABEL[r.service_type] ?? r.service_type,
    r.total_count,
    r.men_count      ?? '',
    r.women_count    ?? '',
    r.children_count ?? '',
    r.first_timers   ?? 0,
    r.notes          ?? '',
    r.recorded_by.name,
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `swgga-attendance-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}