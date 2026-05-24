// src/components/admin/members/MemberDrawer.tsx
// Slide-in drawer for viewing and editing a single member profile

'use client'

import { useState, useEffect } from 'react'
import {
  X, User, Shield, Zap, CheckCircle2, XCircle,
  Clock, Edit3, Save, ChevronRight
} from 'lucide-react'
import {
  useMember, useUpdateMember, useUpdateMemberStatus,
  type AdminMember
} from '@/hooks/admin/useMembers'
import PastoralNotesSection from './PastoralNotesSection'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:   { icon: CheckCircle2, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10 border-[#22C55E]/20', dot: 'bg-[#22C55E]', label: 'Active'   },
  inactive: { icon: XCircle,      color: 'text-[#F87171]', bg: 'bg-[#F87171]/10 border-[#F87171]/20', dot: 'bg-[#F87171]', label: 'Inactive' },
  pending:  { icon: Clock,        color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20', dot: 'bg-[#F59E0B]', label: 'Pending'  },
}

const ROLE_LABELS: Record<string, string> = {
  R01: 'Super Admin', R02: 'Senior Pastor',  R03: 'Admin',
  R04: 'Treasurer',   R05: 'Dept Head',      R06: 'CTY Admin',
  R07: 'Media Lead',  R08: 'Prayer Coord.',  R09: 'Cell Leader',
  R10: 'Member',      R11: 'Guest',
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[#334155] text-[10px] uppercase tracking-widest font-bold mb-1">
        {label}
      </p>
      <p className="text-white/80 text-sm">
        {value || <span className="text-[#334155] italic">Not set</span>}
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MemberDrawerProps {
  memberId:        string | null
  onClose:         () => void
  currentUserRole: string
  onStatusChange?: () => void
}

export default function MemberDrawer({
  memberId,
  onClose,
  currentUserRole,
  onStatusChange,
}: MemberDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData,  setEditData]  = useState<Partial<AdminMember>>({})

  const { data, isLoading }                         = useMember(memberId ?? '', !!memberId)
  const { mutate: updateMember,  isPending: isSaving }      = useUpdateMember()
  const { mutate: updateStatus,  isPending: isStatusPending } = useUpdateMemberStatus()

  const member           = data?.member
  const canEdit          = ['R01', 'R02', 'R03'].includes(currentUserRole)
  const canSeePastoral   = currentUserRole === 'R01' || currentUserRole === 'R02'
  const canChangeStatus  = ['R01', 'R02', 'R03'].includes(currentUserRole)

  // Reset editing when a different member is opened
  useEffect(() => {
    setIsEditing(false)
    setEditData({})
  }, [memberId])

  function handleEdit() {
    if (!member) return
    setEditData({
      full_name:     member.full_name,
      phone:         member.phone,
      address:       member.address,
      date_of_birth: member.date_of_birth,
      joined_date:   member.joined_date,
    })
    setIsEditing(true)
  }

  function handleSave() {
    if (!memberId) return
    updateMember(
      { id: memberId, data: editData },
      { onSuccess: () => { setIsEditing(false); onStatusChange?.() } }
    )
  }

  function handleStatusToggle() {
    if (!member || !memberId) return
    const newStatus = member.membership_status === 'active' ? 'inactive' : 'active'
    updateStatus({ memberId, status: newStatus }, { onSuccess: onStatusChange })
  }

  const isOpen = !!memberId

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40
                    transition-opacity duration-300
                    ${isOpen
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 pointer-events-none'
                    }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[520px] z-50
                    bg-[#060E1A] border-l border-white/5
                    flex flex-col overflow-hidden
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-white/5 bg-[#0A1628] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A]/40 border border-[#1E3A8A]/30
                            flex items-center justify-center">
              <User size={15} className="text-[#93C5FD]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Member Profile</h2>
              <p className="text-[#64748B] text-xs">View and edit member details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10
                       flex items-center justify-center
                       text-[#64748B] hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              {[80, 120, 200].map(h => (
                <div
                  key={h}
                  className="rounded-xl bg-[#0A1628] animate-pulse"
                  style={{ height: h }}
                />
              ))}
            </div>
          ) : member ? (
            <>
              {/* Identity card */}
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {member.profile_photo_url ? (
                    <img
                      src={member.profile_photo_url}
                      alt={member.full_name}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A]/20
                                    border border-[#1E3A8A]/30
                                    flex items-center justify-center">
                      <span className="text-[#93C5FD] font-bold text-xl">
                        {member.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-[family-name:var(--font-heading)] text-white
                                  text-lg font-bold leading-tight truncate">
                    {member.full_name}
                  </h3>
                  <p className="text-[#64748B] text-xs mt-0.5 truncate">
                    {member.email}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {/* Role badge */}
                    <span className="px-2 py-0.5 rounded-full bg-[#1E3A8A]/20
                                     border border-[#1E3A8A]/30 text-[#93C5FD]
                                     text-[10px] font-bold">
                      {ROLE_LABELS[member.user_role] ?? member.user_role}
                    </span>
                    {/* Ministry tag */}
                    {member.ministry && (
                      <span className="px-2 py-0.5 rounded-full bg-[#B8860B]/10
                                       border border-[#B8860B]/20 text-[#F5C518]
                                       text-[10px] font-bold">
                        {member.ministry.name}
                      </span>
                    )}
                    {/* Status badge */}
                    {(() => {
                      const s = STATUS_CONFIG[member.membership_status as keyof typeof STATUS_CONFIG]
                      return (
                        <span className={`px-2 py-0.5 rounded-full border
                                          text-[10px] font-bold ${s.bg} ${s.color}`}>
                          {s.label}
                        </span>
                      )
                    })()}
                    {/* Word streak */}
                    {member.word_streak_count > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full
                                       bg-orange-500/10 border border-orange-500/20
                                       text-orange-400 text-[10px] font-bold">
                        <Zap size={9} />
                        {member.word_streak_count}d streak
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {(canEdit || canChangeStatus) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {canEdit && !isEditing && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                                 bg-[#0A1628] border border-white/5
                                 hover:border-white/15 text-[#64748B] hover:text-white
                                 text-xs font-medium transition-all duration-200"
                    >
                      <Edit3 size={12} /> Edit Profile
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                                   bg-[#1E3A8A] hover:bg-[#2D4A9A] text-white
                                   text-xs font-bold transition-colors duration-200"
                      >
                        <Save size={12} />
                        {isSaving ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                                   bg-white/5 text-[#64748B] hover:text-white
                                   text-xs font-medium transition-colors duration-200"
                      >
                        <X size={12} /> Cancel
                      </button>
                    </>
                  )}
                  {canChangeStatus && !isEditing && (
                    <button
                      onClick={handleStatusToggle}
                      disabled={isStatusPending}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg
                                  border text-xs font-medium transition-all duration-200
                                  ${member.membership_status === 'active'
                                    ? 'bg-[#F87171]/10 border-[#F87171]/20 text-[#F87171] hover:bg-[#F87171]/20'
                                    : 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20'
                                  }`}
                    >
                      {member.membership_status === 'active'
                        ? <><XCircle size={12} /> Deactivate</>
                        : <><CheckCircle2 size={12} /> Activate</>
                      }
                    </button>
                  )}
                </div>
              )}

              {/* Contact & Personal */}
              <div className="bg-[#0A1628] border border-white/5 rounded-xl p-5 mb-4">
                <p className="text-[#334155] text-[10px] uppercase tracking-widest
                               font-bold mb-4">
                  Contact & Personal
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {isEditing ? (
                    <>
                      {[
                        { key: 'full_name',     label: 'Full Name',     type: 'text' },
                        { key: 'phone',         label: 'Phone',         type: 'tel'  },
                        { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
                        { key: 'joined_date',   label: 'Joined Date',   type: 'date' },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className="text-[#334155] text-[10px] uppercase
                                            tracking-widest font-bold block mb-1">
                            {label}
                          </label>
                          <input
                            type={type}
                            value={(editData as any)[key] ?? ''}
                            onChange={e =>
                              setEditData(prev => ({ ...prev, [key]: e.target.value }))
                            }
                            className="w-full bg-[#0F1E35] border border-white/10
                                       rounded-lg px-3 py-2 text-white text-sm
                                       focus:outline-none focus:border-[#1E3A8A]/60
                                       transition-colors"
                          />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="text-[#334155] text-[10px] uppercase
                                          tracking-widest font-bold block mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={editData.address ?? ''}
                          onChange={e =>
                            setEditData(prev => ({ ...prev, address: e.target.value }))
                          }
                          className="w-full bg-[#0F1E35] border border-white/10
                                     rounded-lg px-3 py-2 text-white text-sm
                                     focus:outline-none focus:border-[#1E3A8A]/60"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Field label="Phone"
                        value={member.phone ?? member.phone} />
                      <Field label="Email"
                        value={member.email} />
                      <Field label="Date of Birth"
                        value={member.date_of_birth
                          ? new Date(member.date_of_birth).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : null} />
                      <Field label="Joined"
                        value={member.joined_date
                          ? new Date(member.joined_date).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : null} />
                      <div className="col-span-2">
                        <Field label="Address" value={member.address} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Church involvement */}
              <div className="bg-[#0A1628] border border-white/5 rounded-xl p-5 mb-4">
                <p className="text-[#334155] text-[10px] uppercase tracking-widest
                               font-bold mb-4">
                  Church Involvement
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Ministry"
                    value={member.ministry?.name} />
                  <Field label="Cell Group"
                    value={member.cell_group_id ?? '—'} />
                  <Field label="Word Streak"
                    value={`${member.word_streak_count} days`} />
                  <Field label="Platform Role"
                    value={ROLE_LABELS[member.user_role]} />
                </div>
              </div>

              {/* Pastoral Notes — ONLY rendered for R01 and R02, not present in DOM otherwise */}
              {canSeePastoral && (
                <PastoralNotesSection
                  memberId={memberId!}
                  memberName={member.full_name}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0A1628] border border-white/5
                              flex items-center justify-center mb-3">
                <User size={22} className="text-[#334155]" />
              </div>
              <p className="text-[#64748B] text-sm">Member not found</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}