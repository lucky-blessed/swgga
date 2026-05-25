// src/components/admin/media/MediaDrawer.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  X, Pencil, Save, Loader2, Trash2,
  Play, Video, Mic, FileText, Radio,
  Download, ExternalLink, BookOpen,
} from 'lucide-react'
import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import {
  useUpdateSermon, useDeleteSermon,
  CONTENT_TYPE_LABELS,
  type Sermon, type ContentType, type UpdateSermonPayload,
} from '@/hooks/admin/useMedia'

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTENT_TYPE_ICONS: Record<ContentType, any> = {
  video_youtube:  Play,
  video_facebook: Video,
  audio_s3:       Mic,
  podcast:        Radio,
  notes_pdf:      FileText,
}

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  video_youtube:  'text-red-400 bg-red-400/10 border-red-400/20',
  video_facebook: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  audio_s3:       'text-purple-400 bg-purple-400/10 border-purple-400/20',
  podcast:        'text-green-400 bg-green-400/10 border-green-400/20',
  notes_pdf:      'text-orange-400 bg-orange-400/10 border-orange-400/20',
}

const CONTENT_TYPES: ContentType[] = [
  'video_youtube', 'video_facebook', 'audio_s3', 'podcast', 'notes_pdf'
]

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  sermon:  Sermon | null
  onClose: () => void
}

export default function MediaDrawer({ sermon, onClose }: Props) {
  const { user }   = useAdminUser()
  const canEdit    = ['R01', 'R02', 'R07'].includes(String(user?.role ?? ''))
  const canDelete  = user?.role === 'R01'

  const updateMutation = useUpdateSermon()
  const deleteMutation = useDeleteSermon()

  const [editing,  setEditing]  = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [error,    setError]    = useState('')
  const [form, setForm] = useState<UpdateSermonPayload>({})

  useEffect(() => {
    if (sermon) {
      setForm({
        title:            sermon.title,
        content_type:     sermon.content_type,
        video_url:      sermon.video_url,
        audio_url:        sermon.audio_url,
        notes_url:        sermon.notes_url,
        speaker:          sermon.speaker,
        series:           sermon.series,
        topic:            sermon.topic,
        scripture:        sermon.scripture,
        sermon_date:      sermon.sermon_date,
        download_enabled: sermon.download_enabled,
      })
      setEditing(false)
      setError('')
      setShowConfirmDelete(false)
    }
  }, [sermon])

  if (!sermon) return null

  const Icon        = CONTENT_TYPE_ICONS[sermon.content_type]
  const colorClass  = CONTENT_TYPE_COLORS[sermon.content_type]
  const mediaUrl    = sermon.video_url ?? sermon.audio_url ?? sermon.notes_url ?? null

  async function handleSave() {
    setError('')
    if (!form.title?.trim())    { setError('Title is required.');        return }
    if (!form.speaker?.trim())  { setError('Speaker is required.');      return }
    if (!form.sermon_date)      { setError('Sermon date is required.');  return }
    try {
      await updateMutation.mutateAsync({ id: sermon!.id, ...form })
      setEditing(false)
    } catch (e: any) {
      setError(e.message ?? 'Failed to update sermon.')
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(sermon!.id)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete sermon.')
    }
  }

  function textField(label: string, key: keyof UpdateSermonPayload, type = 'text') {
    const displayValue = sermon![key as keyof Sermon]
    const displayStr   = displayValue != null ? String(displayValue) : null

    return (
      <div>
        <label className="block text-xs text-[#64748B] mb-1">{label}</label>
        {editing ? (
          <input
            type={type}
            value={(form[key] as string) ?? ''}
            onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value || null }))}
            className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-3 py-2
                       text-white text-sm focus:outline-none focus:border-[#1E3A8A]"
          />
        ) : (
          <p className="text-white text-sm">
            {displayStr ?? <span className="text-[#334155]">—</span>}
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A1628]
                      border-l border-white/5 z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/5">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                rounded-lg border text-xs font-medium ${colorClass}`}>
                <Icon size={11} />
                {CONTENT_TYPE_LABELS[sermon.content_type]}
              </span>
            </div>
            <h2 className="text-white font-semibold text-sm leading-snug truncate">
              {sermon.title}
            </h2>
            <p className="text-[#64748B] text-xs mt-0.5">{sermon.speaker}</p>
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

          {/* Media URL */}
          {mediaUrl && (
            <div className="bg-[#060E1A] border border-white/5 rounded-xl px-4 py-3
                            flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={14} className={colorClass.split(' ')[0]} />
                <span className="text-[#64748B] text-xs truncate">{mediaUrl}</span>
              </div>
              
                <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] hover:text-white flex-shrink-0 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Core details */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Sermon Details
            </p>
            <div className="space-y-4">
              {textField('Title', 'title')}
              {textField('Speaker', 'speaker')}
              {textField('Date', 'sermon_date', 'date')}

              {editing ? (
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Content Type</label>
                  <select
                    value={form.content_type}
                    onChange={e => setForm(prev => ({
                      ...prev, content_type: e.target.value as ContentType
                    }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  >
                    {CONTENT_TYPES.map(t => (
                      <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          {/* Media URLs in edit mode */}
          {editing && (
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
                Media URLs
              </p>
              <div className="space-y-3">
                {textField('YouTube URL', 'video_url')}
                {textField('Audio URL (S3)', 'audio_url')}
                {textField('Notes PDF URL', 'notes_url')}
              </div>
            </div>
          )}

          {/* Classification */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Classification
            </p>
            <div className="space-y-4">
              {textField('Series', 'series')}
              {textField('Topic', 'topic')}
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Scripture</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.scripture ?? ''}
                    onChange={e => setForm(prev => ({
                      ...prev, scripture: e.target.value || null
                    }))}
                    className="w-full bg-[#060E1A] border border-white/10 rounded-xl
                               px-3 py-2 text-white text-sm focus:outline-none
                               focus:border-[#1E3A8A]"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    {sermon.scripture && (
                      <BookOpen size={12} className="text-[#B8860B] flex-shrink-0" />
                    )}
                    <p className="text-white text-sm">
                      {sermon.scripture ?? <span className="text-[#334155]">—</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Download toggle */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Settings
            </p>
            <div className="flex items-center justify-between bg-[#060E1A]
                            border border-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Download size={14} className="text-[#64748B]" />
                <div>
                  <p className="text-white text-sm">Download Enabled</p>
                  <p className="text-[#334155] text-xs">
                    Allow members to download this sermon
                  </p>
                </div>
              </div>
              {editing ? (
                <button
                  onClick={() => setForm(prev => ({
                    ...prev, download_enabled: !prev.download_enabled
                  }))}
                  className={`w-10 h-5 rounded-full transition-colors relative
                              ${form.download_enabled
                                ? 'bg-[#1E3A8A]'
                                : 'bg-white/10'
                              }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white
                                    transition-transform
                                    ${form.download_enabled
                                      ? 'translate-x-5'
                                      : 'translate-x-0.5'
                                    }`} />
                </button>
              ) : (
                <span className={`text-xs font-bold px-2 py-1 rounded-lg
                                  ${sermon.download_enabled
                                    ? 'bg-green-400/10 text-green-400'
                                    : 'bg-white/5 text-[#334155]'
                                  }`}>
                  {sermon.download_enabled ? 'ON' : 'OFF'}
                </span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">
              Record Info
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B] text-sm">Ministry</span>
                <span className="text-white text-sm">
                  {sermon.ministries?.name ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] text-sm">Sanity ID</span>
                <span className="text-[#334155] text-xs font-mono truncate max-w-[200px]">
                  {sermon.sanity_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] text-sm">Created</span>
                <span className="text-white text-sm">
                  {new Date(sermon.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Delete */}
          {canDelete && (
            <div className="border-t border-white/5 pt-4">
              {showConfirmDelete ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                  <p className="text-red-400 text-sm font-medium">
                    Delete this sermon permanently?
                  </p>
                  <p className="text-[#64748B] text-xs">
                    This action cannot be undone.
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
                  <Trash2 size={14} /> Delete Sermon
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