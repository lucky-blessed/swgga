// src/hooks/admin/useMembers.ts
// TanStack Query hooks for the member management module

import {
    useQuery,
    useMutation,
    useQueryClient,
  } from '@tanstack/react-query'
  
  // ─── Types ────────────────────────────────────────────────────────────────────
  
  export interface AdminMember {
    id:                 string
    user_id:            string
    full_name:          string
    phone:              string | null
    date_of_birth:      string | null
    address:            string | null
    joined_date:        string | null
    has_pastoral_notes: boolean
    created_at:         string
    users: {
      id:                string
      email:             string | null
      phone:             string | null
      role:              string
      status:            'active' | 'inactive' | 'pending'
      word_streak:       number
      profile_photo_url: string | null
      created_at:        string
    }
    ministries: {
      id:   string
      name: string
      slug: string
    } | null
    cell_groups: {
      id:       string
      name:     string
      location: string
    } | null
  }
  
  export interface MembersResponse {
    members: AdminMember[]
    total:   number
    page:    number
    limit:   number
    pages:   number
  }
  
  export interface MemberFilters {
    search?:   string
    status?:   'all' | 'active' | 'inactive' | 'pending'
    ministry?: string
    page?:     number
    limit?:    number
  }
  
  // ─── Fetchers ─────────────────────────────────────────────────────────────────
  
  async function fetchMembers(filters: MemberFilters): Promise<MembersResponse> {
    const params = new URLSearchParams()
    if (filters.search)                        params.set('search',   filters.search)
    if (filters.status   && filters.status   !== 'all') params.set('status',   filters.status)
    if (filters.ministry && filters.ministry !== 'all') params.set('ministry', filters.ministry)
    params.set('page',  String(filters.page  ?? 1))
    params.set('limit', String(filters.limit ?? 20))
  
    const res = await fetch(`/api/v1/admin/members?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to fetch members')
    return res.json()
  }
  
  async function fetchMember(id: string): Promise<{ member: AdminMember }> {
    const res = await fetch(`/api/v1/admin/members/${id}`)
    if (!res.ok) throw new Error('Failed to fetch member')
    return res.json()
  }
  
  async function fetchPastoralNotes(id: string): Promise<{
    notes:            string
    hasPastoralNotes: boolean
    updatedAt:        string
  }> {
    const res = await fetch(`/api/v1/admin/members/${id}/notes`)
    if (!res.ok) throw new Error('Failed to fetch notes')
    return res.json()
  }
  
  // ─── Query keys ───────────────────────────────────────────────────────────────
  
  export const memberKeys = {
    all:    () => ['admin', 'members'] as const,
    list:   (f: MemberFilters) => ['admin', 'members', 'list', f] as const,
    detail: (id: string)       => ['admin', 'members', 'detail', id] as const,
    notes:  (id: string)       => ['admin', 'members', 'notes',  id] as const,
  }
  
  // ─── Query hooks ──────────────────────────────────────────────────────────────
  
  export function useMembers(filters: MemberFilters) {
    return useQuery({
      queryKey:        memberKeys.list(filters),
      queryFn:         () => fetchMembers(filters),
      staleTime:       30_000,
      placeholderData: (prev: any) => prev,
    })
  }
  
  export function useMember(id: string, enabled = true) {
    return useQuery({
      queryKey: memberKeys.detail(id),
      queryFn:  () => fetchMember(id),
      enabled:  enabled && !!id,
      staleTime: 30_000,
    })
  }
  
  export function usePastoralNotes(id: string, enabled = true) {
    return useQuery({
      queryKey: memberKeys.notes(id),
      queryFn:  () => fetchPastoralNotes(id),
      enabled:  enabled && !!id,
      staleTime: 0,
    })
  }
  
  // ─── Mutation hooks ───────────────────────────────────────────────────────────
  
  export function useUpdateMemberStatus() {
    const qc = useQueryClient()
  
    return useMutation({
      mutationFn: async ({
        memberId,
        status,
      }: {
        memberId: string
        status:   'active' | 'inactive' | 'pending'
      }) => {
        const res = await fetch('/api/v1/admin/members', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ memberId, status }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error((err as any).error ?? 'Failed to update status')
        }
        return res.json()
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: memberKeys.all() })
      },
    })
  }
  
  export function useUpdateMember() {
    const qc = useQueryClient()
  
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<AdminMember> }) => {
        const res = await fetch(`/api/v1/admin/members/${id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update member')
        return res.json()
      },
      onSuccess: (_data: any, { id }: { id: string; data: Partial<AdminMember> }) => {
        qc.invalidateQueries({ queryKey: memberKeys.detail(id) })
        qc.invalidateQueries({ queryKey: memberKeys.all() })
      },
    })
  }
  
  export function useSavePastoralNotes() {
    const qc = useQueryClient()
  
    return useMutation({
      mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
        const res = await fetch(`/api/v1/admin/members/${id}/notes`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ notes }),
        })
        if (!res.ok) throw new Error('Failed to save notes')
        return res.json()
      },
      onSuccess: (_data: any, { id }: { id: string; notes: string }) => {
        qc.invalidateQueries({ queryKey: memberKeys.notes(id) })
        qc.invalidateQueries({ queryKey: memberKeys.detail(id) })
        qc.invalidateQueries({ queryKey: memberKeys.all() })
      },
    })
  }
  
  // ─── CSV export ───────────────────────────────────────────────────────────────
  
  export function exportMembersToCSV(members: AdminMember[]) {
    const headers = [
      'Full Name', 'Email', 'Phone', 'Role', 'Status',
      'Ministry', 'Word Streak', 'Joined',
    ]
  
    const rows = members.map(m => [
      m.full_name,
      m.users.email            ?? '',
      m.users.phone ?? m.phone ?? '',
      m.users.role,
      m.users.status,
      m.ministries?.name       ?? '',
      String(m.users.word_streak),
      m.joined_date            ?? '',
    ])
  
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `swgga-members-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }