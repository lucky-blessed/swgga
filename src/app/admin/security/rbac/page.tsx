'use client'
// src/app/admin/security/rbac/page.tsx
// Per-user permission management - R01 and R02 only

import { useState, useEffect } from 'react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import { Shield, CheckCircle, XCircle, ChevronDown, ChevronUp, Search } from 'lucide-react'

interface GrantablePerm {
  key:   string
  label: string
  desc:  string
}

interface AdminUser {
  id:          string
  email:       string
  role:        string
  role_label:  string
  is_active:   boolean
  name:        string
  permissions: Record<string, boolean>
}

const ROLE_COLORS: Record<string, string> = {
  R01: 'bg-red-500/10 text-red-400 border-red-500/20',
  R02: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  R03: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  R04: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  R05: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  R06: 'bg-green-500/10 text-green-400 border-green-500/20',
  R07: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  R08: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  R09: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export default function RBACSettingsPage() {
  const { user: actor } = useAdminUser()

  const [users,      setUsers]      = useState<AdminUser[]>([])
  const [grantable,  setGrantable]  = useState<GrantablePerm[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [saving,     setSaving]     = useState<string | null>(null) // 'userId:permKey'
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/v1/admin/rbac/permissions', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setUsers(data.users ?? [])
        setGrantable(data.grantable ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function togglePermission(userId: string, permission: string, currentlyGranted: boolean) {
    const key = `${userId}:${permission}`
    setSaving(key)
    try {
      const res = await fetch('/api/v1/admin/rbac/permissions', {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ user_id: userId, permission, granted: !currentlyGranted }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')

      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u
        return { ...u, permissions: { ...u.permissions, [permission]: !currentlyGranted } }
      }))

      const perm = grantable.find(p => p.key === permission)
      setToast({
        msg: `${perm?.label ?? permission} ${!currentlyGranted ? 'granted' : 'revoked'} - notification sent`,
        ok: true,
      })
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Failed to update', ok: false })
    } finally {
      setSaving(null)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role_label.toLowerCase().includes(search.toLowerCase())
  )

  // Can actor modify this user?
  function canModify(targetRole: string): boolean {
    if (!actor) return false
    if (actor.role === 'R01') return true
    if (actor.role === 'R02') return targetRole !== 'R01'
    return false
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-playfair">RBAC Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage per-user permission overrides. Changes are logged and users are notified by email.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
          ${toast.ok
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          {toast.ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Info box */}
      <div className="bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 rounded-xl px-5 py-4 space-y-1">
        <p className="text-sm font-semibold text-blue-300">How this works</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Each admin user has a base set of permissions determined by their role.
          Use this page to grant additional permissions or restrict default ones.
          Every change creates an audit log entry and sends an email notification to the affected admin.
          Permissions remain active until manually revoked.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or role..."
          className="w-full bg-[#0A1628] border border-white/10 rounded-xl px-4 py-2.5 pl-10
                     text-sm text-white placeholder:text-gray-600
                     focus:outline-none focus:border-[#1E3A8A] transition-colors"
        />
      </div>

      {/* Users list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#0A1628] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => {
            const isExpanded  = expanded === user.id
            const isModifiable = canModify(user.role)
            const grantCount  = Object.values(user.permissions).filter(Boolean).length

            return (
              <div key={user.id}
                className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">

                {/* User row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : user.id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4
                             hover:bg-white/2 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                                    flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-400">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                      ${ROLE_COLORS[user.role] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {user.role_label}
                    </span>
                    {grantCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#B8860B]/10
                                       text-[#F5C518] border border-[#B8860B]/20">
                        {grantCount} extra
                      </span>
                    )}
                    {!isModifiable && (
                      <span className="text-xs text-gray-600">Protected</span>
                    )}
                    {isExpanded
                      ? <ChevronUp size={15} className="text-gray-400" />
                      : <ChevronDown size={15} className="text-gray-400" />
                    }
                  </div>
                </button>

                {/* Permissions grid */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-6 py-5 space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      Permission Overrides
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {grantable.map(perm => {
                        const isGranted = user.permissions[perm.key] === true
                        const isSaving  = saving === `${user.id}:${perm.key}`

                        return (
                          <div key={perm.key}
                            className={`flex items-start justify-between gap-3 p-4 rounded-xl border
                              transition-all ${isGranted
                                ? 'bg-green-500/5 border-green-500/20'
                                : 'bg-[#060E1A] border-white/5'
                              }`}>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white">{perm.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{perm.desc}</p>
                            </div>
                            <button
                              onClick={() => isModifiable && togglePermission(user.id, perm.key, isGranted)}
                              disabled={!isModifiable || isSaving}
                              className={`flex-shrink-0 mt-0.5 w-10 h-6 rounded-full transition-all
                                relative disabled:opacity-40 disabled:cursor-not-allowed
                                ${isGranted ? 'bg-green-500' : 'bg-white/10'}`}
                            >
                              {isSaving ? (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-3 h-3 border border-white/40 border-t-white
                                                   rounded-full animate-spin" />
                                </span>
                              ) : (
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow
                                  transition-transform ${isGranted ? 'left-5' : 'left-1'}`} />
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    {!isModifiable && (
                      <p className="text-xs text-gray-600 mt-2">
                        {user.role === 'R01'
                          ? 'Super Admin permissions cannot be modified.'
                          : 'You do not have permission to modify this account.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              No admin users found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
