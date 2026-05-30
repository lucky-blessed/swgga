'use client'
// src/app/admin/settings/accounts/page.tsx

import { useState, useEffect } from 'react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import { Shield, Plus, X, CheckCircle } from 'lucide-react'

const PRESET_ROLES = [
  { value: 'R02', label: 'Senior Pastor',        desc: 'Full admin access' },
  { value: 'R03', label: 'Admin / Secretary',    desc: 'Member management, no financials' },
  { value: 'R04', label: 'Treasurer',            desc: 'Financial records only' },
  { value: 'R05', label: 'Department Head',      desc: 'Own ministry only' },
  { value: 'R06', label: 'CTY Admin',            desc: 'CTY content only' },
  { value: 'R07', label: 'Media / Tech Lead',    desc: 'Sermon and media upload' },
  { value: 'R08', label: 'Prayer Coordinator',   desc: 'Prayer queue only' },
  { value: 'R09', label: 'Cell / Impact Leader', desc: 'Attendance for own group' },
  { value: 'custom', label: 'Custom Role',       desc: 'Enter a custom role title' },
]

const ROLE_LABELS: Record<string, string> = {
  R01: 'Super Admin', R02: 'Senior Pastor', R03: 'Admin / Secretary',
  R04: 'Treasurer',   R05: 'Department Head', R06: 'CTY Admin',
  R07: 'Media Lead',  R08: 'Prayer Coordinator', R09: 'Cell Leader',
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

interface AdminAccount {
  id:              string
  email:           string
  phone:           string | null
  role:            string
  role_label:      string
  is_active:       boolean
  password_is_set: boolean
  name:            string
  created_at:      string
}

export default function AdminAccountsPage() {
  const { user } = useAdminUser()
  const actorRole = user?.role ?? ''

  const [accounts,    setAccounts]    = useState<AdminAccount[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [showForm,    setShowForm]    = useState(false)

  // Form state
  const [firstName,   setFirstName]   = useState('')
  const [lastName,    setLastName]    = useState('')
  const [email,       setEmail]       = useState('')
  const [phone,       setPhone]       = useState('')
  const [roleChoice,  setRoleChoice]  = useState('R03')
  const [customRole,  setCustomRole]  = useState('')
  const [creating,    setCreating]    = useState(false)
  const [createErr,   setCreateErr]   = useState('')
  const [createOk,    setCreateOk]    = useState(false)

  const isCustom = roleChoice === 'custom'
  const finalRole = isCustom ? (customRole.trim() || 'R03') : roleChoice

  function resetForm() {
    setFirstName(''); setLastName(''); setEmail('')
    setPhone(''); setRoleChoice('R03'); setCustomRole('')
    setCreateErr('')
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/v1/admin/accounts', { credentials: 'include' })
      const data = await res.json()
      setAccounts(data.accounts ?? [])
    } catch {}
    finally { setLoadingList(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateErr('')
    setCreateOk(false)

    if (isCustom && !customRole.trim()) {
      setCreateErr('Please enter a custom role title.')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/v1/admin/accounts', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:  firstName.trim(),
          last_name:   lastName.trim(),
          email:       email.trim(),
          phone:       phone.trim() || null,
          role:        finalRole,
          custom_role: isCustom ? customRole.trim() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create account')
      setCreateOk(true)
      resetForm()
      setShowForm(false)
      await fetchAccounts()
      setTimeout(() => setCreateOk(false), 5000)
    } catch (e: unknown) {
      setCreateErr(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const availableRoles = actorRole === 'R01'
    ? [{ value: 'R01', label: 'Super Admin', desc: 'Full access, no restrictions' }, ...PRESET_ROLES]
    : PRESET_ROLES

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-playfair">Admin Accounts</h1>
          <p className="text-sm text-gray-400 mt-1">Manage platform administrator accounts</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); resetForm() }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Admin Account'}
        </button>
      </div>

      {/* Success */}
      {createOk && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">
            Account created. A set-password email has been sent to the new admin.
          </p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30 flex items-center justify-center">
              <Shield size={14} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-bold text-white">Create New Admin Account</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">First Name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                  className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#1E3A8A] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Last Name *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
                  className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#1E3A8A] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="admin@example.com"
                  className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#1E3A8A] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+2348012345678"
                  className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#1E3A8A] transition-colors" />
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Assign Role *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableRoles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRoleChoice(r.value)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all
                      ${roleChoice === r.value
                        ? 'bg-[#1E3A8A]/20 border-[#1E3A8A]/60 text-white'
                        : 'bg-[#060E1A] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                  >
                    <p className="font-semibold text-xs">{r.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom role input */}
              {isCustom && (
                <div className="space-y-1.5 mt-2">
                  <label className="text-xs text-gray-400">Custom Role Title *</label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="e.g. Welfare Coordinator, Protocol Officer..."
                    className="w-full bg-[#060E1A] border border-white/10 rounded-lg px-3 py-2.5
                               text-sm text-white placeholder:text-gray-600
                               focus:outline-none focus:border-[#B8860B] transition-colors"
                  />
                  <p className="text-xs text-gray-600">
                    Custom roles are assigned as R09 permissions by default. Contact R01 to adjust.
                  </p>
                </div>
              )}
            </div>

            {createErr && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{createErr}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={creating}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#B8860B] hover:bg-[#B8860B]/80 text-white disabled:opacity-50 transition-colors">
                {creating ? 'Creating...' : 'Create Account & Send Email'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm() }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts list */}
      <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">
            {accounts.length} Admin Account{accounts.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending setup
            </span>
          </div>
        </div>

        {loadingList ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No admin accounts found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {accounts.map(account => {
              const isPending = !account.is_active || account.password_is_set === false
              return (
                <div key={account.id}
                  className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors
                    ${isPending ? 'bg-yellow-500/3 hover:bg-yellow-500/5' : 'hover:bg-white/2'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isPending ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <div className="w-9 h-9 rounded-full bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                                    flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-400">
                        {account.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{account.name}</p>
                      <p className="text-xs text-gray-500 truncate">{account.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLORS[account.role] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {account.role_label}
                    </span>
                    {isPending && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Pending Setup
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
