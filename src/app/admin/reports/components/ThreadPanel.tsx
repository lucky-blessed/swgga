// src/app/admin/reports/components/ThreadPanel.tsx
'use client'

import { useState } from 'react'
import { Send, AlertTriangle } from 'lucide-react'

interface Comment {
  id:             string
  message:        string
  allow_resubmit: boolean
  created_at:     string
  reviewer_name:  string
  feedback_by:    string
}

interface Props {
  comments:      Comment[]
  canComment:    boolean
  reportStatus:  string
  onSubmit:      (message: string, allowResubmit: boolean) => Promise<void>
  currentUserId: string
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1)   return 'Just now'
  if (diffMins < 60)  return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ThreadPanel({ comments, canComment, reportStatus, onSubmit, currentUserId }: Props) {
  const [message,       setMessage]       = useState('')
  const [allowResubmit, setAllowResubmit] = useState(false)
  const [sending,       setSending]       = useState(false)

  const canAddFeedback = canComment && [
    'submitted', 'resubmitted', 'under_review', 'resubmission_requested'
  ].includes(reportStatus)

  async function handleSend() {
    if (!message.trim() || sending) return
    setSending(true)
    try {
      await onSubmit(message.trim(), allowResubmit)
      setMessage('')
      setAllowResubmit(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Send size={20} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-500">No feedback yet</p>
            <p className="text-xs text-gray-600 text-center">
              Feedback and comments will appear here
            </p>
          </div>
        ) : (
          [...comments].reverse().map((c, i) => {
            const isOwn = c.feedback_by === currentUserId
            return (
              <div key={c.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                                flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-blue-400">
                    {c.reviewer_name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] space-y-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-300">{c.reviewer_name}</span>
                    <span className="text-xs text-gray-600">{formatTime(c.created_at)}</span>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${c.allow_resubmit
                      ? 'bg-amber-500/10 border border-amber-500/20 text-white'
                      : isOwn
                        ? 'bg-[#1E3A8A]/30 border border-[#1E3A8A]/20 text-white'
                        : 'bg-[#0D1B2A] border border-white/8 text-gray-200'
                    }`}>
                    {c.message}
                  </div>
                  {c.allow_resubmit && (
                    <div className="flex items-center gap-1.5 px-1">
                      <AlertTriangle size={11} className="text-amber-400" />
                      <span className="text-xs text-amber-400 font-medium">Resubmission required</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input area */}
      {canAddFeedback && (
        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="relative">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend()
              }}
              rows={3}
              placeholder="Write feedback... (Ctrl+Enter to send)"
              className="w-full bg-[#060E1A] border border-white/10 rounded-xl px-4 py-3 pr-12
                         text-sm text-white placeholder:text-gray-600
                         focus:outline-none focus:border-[#1E3A8A]/60 focus:ring-1 focus:ring-[#1E3A8A]/30
                         transition-all resize-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-[#1E3A8A] hover:bg-[#1E3A8A]/80
                         flex items-center justify-center transition-colors disabled:opacity-40">
              {sending
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={13} className="text-white" />
              }
            </button>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setAllowResubmit(s => !s)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                ${allowResubmit
                  ? 'bg-amber-500 border-amber-500'
                  : 'border-white/20 group-hover:border-white/40'
                }`}>
              {allowResubmit && (
                <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              Request resubmission from this person
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
