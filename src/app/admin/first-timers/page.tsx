'use client'
// src/app/admin/first-timers/page.tsx
import { useState, useEffect } from 'react'
import { Users, Phone, Mail, Calendar, ChevronRight, RefreshCw } from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'

interface FirstTimer {
  id: string; first_name: string; last_name: string
  phone: string; email: string | null; heard_from: string | null
  message: string | null; status: string; notes: string | null
  created_at: string; assigned_to: { id: string; name: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:           { label: 'New',          color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
  contacted:     { label: 'Contacted',    color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  following_up:  { label: 'Following Up', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  converted:     { label: 'Converted',    color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
}

export default function FirstTimersPage() {
  const { user } = useAdminUser()
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([])
  const [loading, setLoading]         = useState(true)
  const [status, setStatus]           = useState('all')
  const [selected, setSelected]       = useState<FirstTimer | null>(null)
  const [saving, setSaving]           = useState(false)
  const [editNotes, setEditNotes]     = useState('')
  const [editStatus, setEditStatus]   = useState('')

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: '50' })
    if (status !== 'all') params.set('status', status)
    const res = await fetch(`/api/v1/admin/first-timers?${params}`)
    const data = await res.json()
    setFirstTimers(data.first_timers ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  function openDrawer(ft: FirstTimer) {
    setSelected(ft)
    setEditNotes(ft.notes ?? '')
    setEditStatus(ft.status)
  }

  async function saveUpdates() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/v1/admin/first-timers/${selected.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: editStatus, notes: editNotes }),
    })
    setSaving(false)
    setSelected(null)
    load()
  }

  const counts = firstTimers.reduce((acc, ft) => {
    acc[ft.status] = (acc[ft.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-playfair">First Timers</h1>
          <p className="text-sm text-gray-400 mt-1">Manage visitor submissions and follow-ups</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="bg-[#0A1628] border border-white/5 rounded-2xl p-4">
            <p className="text-2xl font-bold text-white">{counts[key] ?? 0}</p>
            <p className={`text-xs font-semibold mt-1 ${cfg.color}`}>{cfg.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'new', 'contacted', 'following_up', 'converted'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${status === s ? 'bg-[#1E3A8A] text-white' : 'text-gray-400 hover:text-white bg-white/5'}`}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0A1628] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Name', 'Contact', 'Heard From', 'Status', 'Assigned To', 'Date', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">Loading...</td></tr>
            ) : firstTimers.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">No first timers found</td></tr>
            ) : firstTimers.map(ft => {
              const cfg = STATUS_CONFIG[ft.status]
              return (
                <tr key={ft.id} className="hover:bg-white/2 transition-colors cursor-pointer" onClick={() => openDrawer(ft)}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{ft.first_name} {ft.last_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {ft.phone}</span>
                      {ft.email && <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} /> {ft.email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{ft.heard_from ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg?.bg} ${cfg?.color}`}>
                      {cfg?.label ?? ft.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{ft.assigned_to?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={11} /> {new Date(ft.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3"><ChevronRight size={14} className="text-gray-600" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-[#0A1628] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">{selected.first_name} {selected.last_name}</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-center gap-2"><Phone size={13} /> {selected.phone}</p>
              {selected.email && <p className="flex items-center gap-2"><Mail size={13} /> {selected.email}</p>}
              {selected.heard_from && <p>Heard from: {selected.heard_from}</p>}
              {selected.message && <p className="bg-white/5 rounded-xl p-3 text-gray-300">{selected.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="following_up">Following Up</option>
                <option value="converted">Converted</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Notes</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                placeholder="Add follow-up notes..."
                className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-400 hover:bg-white/5">
                Cancel
              </button>
              <button onClick={saveUpdates} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
