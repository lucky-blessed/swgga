// src/components/admin/events/EventDrawer.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  X, Pencil, Save, Loader2, Trash2, Download,
  Calendar, Clock, MapPin, Users,
  RefreshCw, CheckCircle2,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useUpdateEvent, useDeleteEvent,
  formatEventTime,
  type AdminEvent, type UpdateEventPayload,
} from '@/hooks/admin/useEvents'

interface Props {
  event:   AdminEvent | null
  onClose: () => void
}

export default function EventDrawer({ event, onClose }: Props) {
  const { user }  = useAdminUser()
  const canEdit   = ['R01', 'R03', 'R05', 'R06'].includes(String(user?.role ?? ''))
  const canDelete = user?.role === 'R01'

  const updateMutation = useUpdateEvent()
  const deleteMutation = useDeleteEvent()

  const [editing,           setEditing]           = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [error,             setError]             = useState('')
  const [form, setForm] = useState<UpdateEventPayload>({})

  useEffect(() => {
    if (event) {
      setForm({
        title:                event.title,
        description:          event.description,
        start_time:           event.start_time.slice(0, 16),
        end_time:             event.end_time?.slice(0, 16) ?? null,
        location:             event.location,
        members_only:         event.members_only,
        registration_enabled: event.registration_enabled,
        is_recurring:         event.is_recurring,
        is_cty_event:         event.is_cty_event,
        image_url:            event.image_url,
      })
      setEditing(false)
      setError('')
      setShowConfirmDelete(false)
    }
  }, [event])

  if (!event) return null

  const isUpcoming = new Date(event.start_time) > new Date()

  async function handleSave() {
    setError('')
    if (!form.title?.trim())  { setError('Title is required.');      return }
    if (!form.start_time)     { setError('Start time is required.'); return }
    try {
      await updateMutation.mutateAsync({ id: event!.id, ...form })
      setEditing(false)
    } catch (e: any) {
      setError(e.message ?? 'Failed to update event.')
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(event!.id)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete event.')
    }
  }

  function toggle(field: keyof UpdateEventPayload) {
    setForm(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  function ToggleRow({ label, desc, field }: {
    label: string; desc: string; field: keyof UpdateEventPayload
  }) {
    const val = form[field] as boolean
    return (
      <div className="flex items-center justify-between bg-[#060E1A]
                      border border-white/5 rounded-xl px-4 py-3">
        <div>
          <p className="text-white text-sm">{label}</p>
          <p className="text-[#334155] text-xs">{desc}</p>
        </div>
        {editing ? (
          <button
            onClick={() => toggle(field)}
            className={`w-10 h-5 rounded-full transition-colors relative
                        ${val ? 'bg-[#1E3A8A]' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                              transition-transform
                              ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        ) : (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg
                            ${val
                              ? 'bg-green-400/10 text-green-400'
                              : 'bg-white/5 text-[#334155]'
                            }`}>
            {val ? 'ON' : 'OFF'}
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A1628]
                      border-l border-white/5 z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/5">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-bold
                                ${isUpcoming
                                  ? 'bg-blue-400/10 border-blue-400/20 text-blue-400'
                                  : 'bg-white/5 border-white/10 text-[#64748B]'
                                }`}>
                {isUpcoming ? 'Upcoming' : 'Past'}
              </span>
              {event.is_cty_event && (
                <span className="text-xs px-2 py-0.5 rounded-full border font-bold
                                  bg-green-400/10 border-green-400/20 text-green-400">
                  CTY
                </span>
              )}
              {event.is_recurring && (
                <span className="text-xs px-2 py-0.5 rounded-full border font-bold
                                  bg-purple-400/10 border-purple-400/20 text-purple-400">
                  Recurring
                </span>
              )}
            </div>
            <h2 className="text-white font-semibold text-sm leading-snug">
              {event.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                           bg-[#1E3A8A] text-white text-sm hover:bg-[#1e40af] transition-colors"
              >
                <Pencil size={13} /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-[#64748B]
                         hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                            px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Core details */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Event Details
            </p>
            <div className="space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Title</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.title ?? ''}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  />
                ) : (
                  <p className="text-white text-sm">{event.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Description</label>
                {editing ? (
                  <textarea
                    rows={3}
                    value={form.description ?? ''}
                    onChange={e => setForm(p => ({
                      ...p, description: e.target.value || null
                    }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A] resize-none"
                  />
                ) : (
                  <p className="text-white text-sm">
                    {event.description ?? <span className="text-[#334155]">—</span>}
                  </p>
                )}
              </div>

              {/* Start time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Start Time</label>
                  {editing ? (
                    <input
                      type="datetime-local"
                      value={form.start_time ?? ''}
                      onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-[#1E3A8A]"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-[#64748B]" />
                      <p className="text-white text-xs">
                        {new Date(event.start_time).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                          timeZone: 'Africa/Lagos',
                        })}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">End Time</label>
                  {editing ? (
                    <input
                      type="datetime-local"
                      value={form.end_time ?? ''}
                      onChange={e => setForm(p => ({
                        ...p, end_time: e.target.value || null
                      }))}
                      className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                                 px-3 py-2 text-white text-sm focus:outline-none
                                 focus:border-[#1E3A8A]"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-[#64748B]" />
                      <p className="text-white text-xs">
                        {event.end_time
                          ? new Date(event.end_time).toLocaleString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                              timeZone: 'Africa/Lagos',
                            })
                          : <span className="text-[#334155]">—</span>
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Location</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.location ?? ''}
                    onChange={e => setForm(p => ({
                      ...p, location: e.target.value || null
                    }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#64748B]" />
                    <p className="text-white text-sm">
                      {event.location ?? <span className="text-[#334155]">—</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flyer */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Event Flyer
            </p>
            <div className="space-y-3">
              {(editing ? form.image_url : event.image_url) && (
                <img
                  src={(editing ? form.image_url : event.image_url) ?? ''}
                  alt={event.title}
                  className="w-full rounded-xl object-cover border border-white/10 max-h-48"
                />
              )}
              {editing && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl
                                    bg-[#060E1A] border border-white/10 text-[#64748B]
                                    hover:text-white hover:border-white/20 text-sm
                                    cursor-pointer transition-colors">
                    <Download size={14} />
                    {form.image_url ? 'Change Flyer' : 'Upload Flyer'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        const res  = await fetch('/api/v1/admin/events/upload', { method: 'POST', body: fd })
                        const data = await res.json()
                        if (data.url) setForm(p => ({ ...p, image_url: data.url }))
                      }}
                    />
                  </label>
                  {form.image_url && (
                    <button
                      onClick={() => setForm(p => ({ ...p, image_url: null }))}
                      className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
              {!editing && !event.image_url && (
                <p className="text-[#334155] text-sm">No flyer uploaded.</p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Settings
            </p>
            <div className="space-y-2">
              <ToggleRow
                label="Members Only"
                desc="Requires login to register"
                field="members_only"
              />
              <ToggleRow
                label="Registration Enabled"
                desc="Show registration button on public site"
                field="registration_enabled"
              />
              <ToggleRow
                label="CTY Event"
                desc="Show on CTY calendar"
                field="is_cty_event"
              />
              <ToggleRow
                label="Recurring"
                desc="This event repeats on a schedule"
                field="is_recurring"
              />
            </div>
          </div>

          {/* Ministry */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-2">
              Ministry
            </p>
            <p className="text-white text-sm">
              {event.ministry?.name ?? <span className="text-[#334155]">—</span>}
            </p>
          </div>

          {/* Registrations */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Registrations ({event.registration_count})
            </p>
            {(!event.registrations || event.registrations.length === 0) ? (
              <p className="text-[#334155] text-sm">No registrations yet.</p>
            ) : (
              <div className="space-y-2">
                {event.registrations.map(r => {
                  const initials = r.user.name.split(' ').slice(0, 2)
                    .map((n: string) => n[0]).join('').toUpperCase()
                  return (
                    <div key={r.id}
                         className="flex items-center gap-3 bg-[#060E1A]
                                    border border-white/5 rounded-xl px-3 py-2">
                      <div className="w-7 h-7 rounded-lg bg-[#1E3A8A]/20 border
                                      border-[#1E3A8A]/30 flex items-center justify-center">
                        <span className="text-[#93C5FD] text-xs font-bold">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs truncate">{r.user.name}</p>
                        <p className="text-[#334155] text-xs">
                          {new Date(r.registered_at).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      {r.attended && (
                        <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Delete */}
          {canDelete && (
            <div className="border-t border-white/5 pt-4">
              {showConfirmDelete ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl
                                p-4 space-y-3">
                  <p className="text-red-400 text-sm font-medium">
                    Delete this event permanently?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 py-2 rounded-xl border border-white/10
                                 text-[#64748B] text-sm hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.status === 'pending'}
                      className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30
                                 text-red-400 text-sm font-bold hover:bg-red-500/30
                                 transition-colors disabled:opacity-50
                                 flex items-center justify-center gap-2"
                    >
                      {deleteMutation.status === 'pending'
                        ? <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                        : <><Trash2 size={14} /> Confirm Delete</>
                      }
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex items-center gap-2 text-red-400/60 hover:text-red-400
                             text-sm transition-colors"
                >
                  <Trash2 size={14} /> Delete Event
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {editing && (
          <div className="px-6 py-4 border-t border-white/5 flex gap-3">
            <button
              onClick={() => { setEditing(false); setError('') }}
              className="flex-1 py-2.5 rounded-xl border border-white/10
                         text-[#64748B] hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.status === 'pending'}
              className="flex-1 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#F5C518]
                         text-black font-semibold text-sm transition-colors
                         disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updateMutation.status === 'pending'
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : <><Save size={14} /> Save Changes</>
              }
            </button>
          </div>
        )}
      </div>
    </>
  )
}