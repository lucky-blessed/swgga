// src/app/admin/members/page.tsx
'use client'

import { useState } from 'react'
import {
  Search, Download, UserPlus, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Lock, Shield,
  Zap, Users, RefreshCw, ChevronDown, X
} from 'lucide-react'
import {
  useMembers, useUpdateMemberStatus, exportMembersToCSV,
  type AdminMember, type MemberFilters,
} from '@/hooks/admin/useMembers'
import MemberDrawer from '@/components/admin/members/MemberDrawer'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import { useDebounce } from '@/hooks/useDebounce'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:   { color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10 border-[#22C55E]/20', dot: 'bg-[#22C55E]' },
  inactive: { color: 'text-[#F87171]', bg: 'bg-[#F87171]/10 border-[#F87171]/20', dot: 'bg-[#F87171]' },
  pending:  { color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20', dot: 'bg-[#F59E0B]' },
  pending_verification: { color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10 border-[#60A5FA]/20', dot: 'bg-[#60A5FA]' },
}

const ROLE_LABELS: Record<string, string> = {
  R01: 'Super Admin', R02: 'Senior Pastor', R03: 'Admin',
  R04: 'Treasurer',   R05: 'Dept Head',     R06: 'CTY Admin',
  R07: 'Media Lead',  R08: 'Prayer Coord',  R09: 'Cell Leader',
  R10: 'Member',      R11: 'Guest',
}

const MINISTRIES = [
  { slug: 'choir',                name: 'Choir'              },
  { slug: 'media-technical',      name: 'Media & Technical'  },
  { slug: 'daughters-of-esther',  name: 'Daughters of Esther'},
  { slug: 'cty-royal-force',      name: 'CTY Royal Force'    },
  { slug: 'children-of-destiny',  name: 'Children of Destiny'},
  { slug: 'prayer-programme',     name: 'Prayer & Programme' },
  { slug: 'ushering',             name: 'Ushering'           },
  { slug: 'impact-fellowship',    name: 'Impact Fellowship'  },
  { slug: 'cty',                  name: 'CTY'                },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                       border text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = ['R01', 'R02', 'R03'].includes(role)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                       text-[10px] font-bold border
                       ${isAdmin
                         ? 'bg-[#1E3A8A]/20 border-[#1E3A8A]/30 text-[#93C5FD]'
                         : 'bg-white/5 border-white/10 text-[#64748B]'
                       }`}>
      {isAdmin && <Shield size={9} />}
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

// ─── Member Row ───────────────────────────────────────────────────────────────

function MemberRow({
  member,
  isSelected,
  onSelect,
  onOpen,
  currentUserRole,
}: {
  member:          AdminMember
  isSelected:      boolean
  onSelect:        (id: string, checked: boolean) => void
  onOpen:          (id: string) => void
  currentUserRole: string
}) {
  const canSeePastoral = currentUserRole === 'R01' || currentUserRole === 'R02'
  const initials = member.full_name
    .split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  return (
    <div
      onClick={() => onOpen(member.id)}
      className={`flex items-center gap-4 px-4 py-3.5
                  border-b border-white/5 last:border-0
                  hover:bg-[#0F1E35] cursor-pointer
                  transition-colors duration-150 group
                  ${isSelected ? 'bg-[#0F1E35]' : ''}`}
    >
      {/* Checkbox */}
      <div
        className="flex-shrink-0"
        onClick={e => { e.stopPropagation(); onSelect(member.id, !isSelected) }}
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

      {/* Avatar */}
      <div className="flex-shrink-0">
        {member.profile_photo_url ? (
          <img
            src={member.profile_photo_url}
            alt={member.full_name}
            className="w-9 h-9 rounded-xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                          flex items-center justify-center">
            <span className="text-[#93C5FD] text-xs font-bold">{initials}</span>
          </div>
        )}
      </div>

      {/* Name + contact */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-heading)] text-white
                            text-sm font-bold truncate max-w-[180px]">
            {member.full_name}
          </span>
          {canSeePastoral && member.pastoral_notes !== null && (
            <Lock size={10} className="text-[#B8860B] flex-shrink-0" aria-label="Has pastoral notes" />          )}
        </div>
        <p className="text-[#64748B] text-xs truncate max-w-[220px]">
          {member.email ?? member.phone ?? '—'}
        </p>
      </div>

      {/* Role */}
      <div className="hidden lg:block flex-shrink-0">
        <RoleBadge role={member.user_role ?? 'R10'} />
      </div>

      {/* Ministry */}
      <div className="hidden xl:block flex-shrink-0 w-32">
        <span className="text-[#64748B] text-xs truncate block">
          {member.ministry?.name ?? '—'}
        </span>
      </div>

      {/* Word streak */}
      <div className="hidden lg:flex flex-shrink-0 items-center gap-1 w-16">
        {(member.word_streak_count ?? 0) > 0 ? (
          <>
            <Zap size={10} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-bold">
              {member.word_streak_count}
            </span>
          </>
        ) : (
          <span className="text-[#334155] text-xs">—</span>
        )}
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <StatusBadge status={member.is_active === false ? 'pending_verification' : (member.membership_status ?? 'pending')} />
      </div>

      {/* Date joined */}
      <div className="hidden 2xl:block flex-shrink-0 w-24 text-right">
        <span className="text-[#64748B] text-xs">
          {member.joined_date
            ? new Date(member.joined_date).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: '2-digit'
              })
            : '—'
          }
        </span>
      </div>

      {/* Chevron */}
      <ChevronRight size={14}
        className="flex-shrink-0 text-[#334155] group-hover:text-[#64748B] transition-colors" />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { user }        = useAdminUser()
  const currentUserRole = user?.role ?? 'R10'

  const [searchInput,    setSearchInput]    = useState('')
  const [statusFilter,   setStatusFilter]   = useState<MemberFilters['status']>('all')
  const [ministryFilter, setMinistryFilter] = useState('all')
  const [page,           setPage]           = useState(1)

  const debouncedSearch = useDebounce(searchInput, 350)

  const filters: MemberFilters = {
    search:   debouncedSearch,
    status:   statusFilter,
    ministry: ministryFilter,
    page,
    limit:    20,
  }

  const { data, isLoading, isFetching, refetch } = useMembers(filters)
  const { mutate: bulkStatus, isPending: isBulkPending } = useUpdateMemberStatus()

  const [selected,       setSelected]       = useState<Set<string>>(new Set())
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null)

  function toggleSelect(id: string, checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  function toggleSelectAll() {
    const ids = data?.members.map((m: AdminMember) => m.id) ?? []
    if (selected.size === ids.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(ids))
    }
  }

  const canBulkAction    = ['R01', 'R02', 'R03'].includes(currentUserRole)
  const hasActiveFilters = !!(searchInput || statusFilter !== 'all' || ministryFilter !== 'all')

  function handleBulkActivate() {
    selected.forEach(id =>
      bulkStatus(
        { memberId: id, status: 'active' },
        { onSuccess: () => { setSelected(new Set()); refetch() } }
      )
    )
  }

  function handleBulkDeactivate() {
    selected.forEach(id =>
      bulkStatus(
        { memberId: id, status: 'inactive' },
        { onSuccess: () => { setSelected(new Set()); refetch() } }
      )
    )
  }

  function resetFilters() {
    setSearchInput('')
    setStatusFilter('all')
    setMinistryFilter('all')
    setPage(1)
  }

  const members      = data?.members ?? []
  const total        = data?.total   ?? 0
  const pages        = data?.pages   ?? 1
  const allSelected  = members.length > 0 && selected.size === members.length
  const someSelected = selected.size > 0

  return (
    <>
      <div className="min-h-screen bg-[#060E1A] p-6">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-white
                            text-2xl font-bold mb-1">
              Member Management
            </h1>
            <p className="text-[#64748B] text-sm">
              {isLoading
                ? 'Loading…'
                : `${total.toLocaleString()} member${total !== 1 ? 's' : ''}`
              }
              {isFetching && !isLoading && (
                <span className="ml-2 text-[#334155]">· refreshing</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              title="Refresh"
              className="w-9 h-9 rounded-xl bg-[#0A1628] border border-white/5
                         hover:border-white/15 flex items-center justify-center
                         text-[#64748B] hover:text-white transition-colors"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => data && exportMembersToCSV(data.members)}
              disabled={members.length === 0}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                         bg-[#0A1628] border border-white/5 hover:border-white/15
                         text-[#64748B] hover:text-white text-xs font-medium
                         transition-colors disabled:opacity-40"
            >
              <Download size={13} /> Export CSV
            </button>

            {['R01', 'R02', 'R03'].includes(currentUserRole) && (
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                           bg-[#1E3A8A] hover:bg-[#2D4A9A] text-white
                           text-xs font-bold transition-colors"
              >
                <UserPlus size={13} /> Add Member
              </button>
            )}
          </div>
        </div>

        {/* Main container */}
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">

          {/* Search + filter bar */}
          <div className="flex items-center gap-3 p-4 border-b border-white/5">
            <div className="relative flex-1 max-w-sm">
              <Search size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#334155]" />
              <input
                type="text"
                value={searchInput}
                onChange={e => { setSearchInput(e.target.value); setPage(1) }}
                placeholder="Search name, email, phone…"
                className="w-full bg-[#0F1E35] border border-white/5 rounded-xl
                           pl-9 pr-4 py-2.5 text-sm text-white
                           placeholder:text-[#334155]
                           focus:outline-none focus:border-[#1E3A8A]/50
                           transition-colors"
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

            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as any); setPage(1) }}
                className="appearance-none bg-[#0F1E35] border border-white/5
                           rounded-xl pl-3 pr-8 py-2.5 text-sm text-white/70
                           focus:outline-none focus:border-[#1E3A8A]/50
                           cursor-pointer transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2
                            text-[#64748B] pointer-events-none" />
            </div>

            <div className="relative hidden md:block">
              <select
                value={ministryFilter}
                onChange={e => { setMinistryFilter(e.target.value); setPage(1) }}
                className="appearance-none bg-[#0F1E35] border border-white/5
                           rounded-xl pl-3 pr-8 py-2.5 text-sm text-white/70
                           focus:outline-none focus:border-[#1E3A8A]/50
                           cursor-pointer transition-colors"
              >
                <option value="all">All Ministries</option>
                {MINISTRIES.map(m => (
                  <option key={m.slug} value={m.slug}>{m.name}</option>
                ))}
              </select>
              <ChevronDown size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2
                            text-[#64748B] pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl
                           bg-[#1E3A8A]/15 border border-[#1E3A8A]/20
                           text-[#93C5FD] text-xs font-medium
                           hover:bg-[#1E3A8A]/25 transition-colors"
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {/* Bulk action bar */}
          {someSelected && canBulkAction && (
            <div className="flex items-center justify-between px-4 py-2.5
                            bg-[#1E3A8A]/10 border-b border-[#1E3A8A]/20">
              <span className="text-[#93C5FD] text-xs font-bold">
                {selected.size} member{selected.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkActivate}
                  disabled={isBulkPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]
                             text-xs font-bold hover:bg-[#22C55E]/20 transition-colors"
                >
                  <CheckCircle2 size={11} /> Activate All
                </button>
                <button
                  onClick={handleBulkDeactivate}
                  disabled={isBulkPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171]
                             text-xs font-bold hover:bg-[#F87171]/20 transition-colors"
                >
                  <XCircle size={11} /> Deactivate All
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-[#64748B] hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Column headers */}
          <div className="flex items-center gap-4 px-4 py-3
                          border-b border-white/5 bg-[#060E1A]">
            <div className="flex-shrink-0 cursor-pointer" onClick={toggleSelectAll}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center
                               transition-colors
                               ${allSelected
                                 ? 'bg-[#1E3A8A] border-[#1E3A8A]'
                                 : 'border-white/10 hover:border-white/30'
                               }`}>
                {allSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!allSelected && someSelected && (
                  <div className="w-2 h-0.5 bg-[#64748B]" />
                )}
              </div>
            </div>
            <div className="w-9 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-[#334155] text-[10px] uppercase tracking-widest font-bold">
                Member
              </span>
            </div>
            <div className="hidden lg:block flex-shrink-0 w-24">
              <span className="text-[#334155] text-[10px] uppercase tracking-widest font-bold">
                Role
              </span>
            </div>
            <div className="hidden xl:block flex-shrink-0 w-32">
              <span className="text-[#334155] text-[10px] uppercase tracking-widest font-bold">
                Ministry
              </span>
            </div>
            <div className="hidden lg:block flex-shrink-0 w-16">
              <span className="text-[#334155] text-[10px] uppercase tracking-widest font-bold">
                Streak
              </span>
            </div>
            <div className="flex-shrink-0 w-20">
              <span className="text-[#334155] text-[10px] uppercase tracking-widest font-bold">
                Status
              </span>
            </div>
            <div className="hidden 2xl:block flex-shrink-0 w-24 text-right">
              <span className="text-[#334155] text-[10px] uppercase tracking-widest font-bold">
                Joined
              </span>
            </div>
            <div className="w-4 flex-shrink-0" />
          </div>

          {/* Rows */}
          {isLoading ? (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}
                  className="flex items-center gap-4 px-4 py-4
                              border-b border-white/5 animate-pulse">
                  <div className="w-4 h-4 rounded bg-white/5" />
                  <div className="w-9 h-9 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 bg-white/5 rounded" />
                    <div className="h-3   w-48 bg-white/5 rounded" />
                  </div>
                  <div className="hidden lg:block w-24 h-5 bg-white/5 rounded-full" />
                  <div className="w-20 h-5 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#0F1E35] border border-white/5
                              flex items-center justify-center mb-4">
                <Users size={24} className="text-[#334155]" />
              </div>
              <p className="text-white/60 text-sm font-medium mb-1">No members found</p>
              {hasActiveFilters && (
                <p className="text-[#64748B] text-xs">
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          ) : (
            members.map((member: AdminMember) => (
              <MemberRow
                key={member.id}
                member={member}
                isSelected={selected.has(member.id)}
                onSelect={toggleSelect}
                onOpen={id => setDrawerMemberId(id)}
                currentUserRole={currentUserRole}
              />
            ))
          )}

          {/* Pagination */}
          {!isLoading && pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3
                            border-t border-white/5 bg-[#060E1A]">
              <p className="text-[#64748B] text-xs">
                Showing {Math.min((page - 1) * 20 + 1, total)}–
                {Math.min(page * 20, total)} of {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg bg-[#0A1628] border border-white/5
                             flex items-center justify-center text-[#64748B]
                             hover:text-white hover:border-white/15
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                  let p: number
                  if (pages <= 5)             p = i + 1
                  else if (page <= 3)         p = i + 1
                  else if (page >= pages - 2) p = pages - 4 + i
                  else                        p = page - 2 + i

                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors
                                  ${p === page
                                    ? 'bg-[#1E3A8A] text-white'
                                    : 'bg-[#0A1628] border border-white/5 text-[#64748B] hover:text-white'
                                  }`}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="w-8 h-8 rounded-lg bg-[#0A1628] border border-white/5
                             flex items-center justify-center text-[#64748B]
                             hover:text-white hover:border-white/15
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member drawer */}
      <MemberDrawer
        memberId={drawerMemberId}
        onClose={() => setDrawerMemberId(null)}
        currentUserRole={currentUserRole}
        onStatusChange={() => refetch()}
      />
    </>
  )
}