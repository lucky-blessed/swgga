// src/components/admin/members/PastoralNotesSection.tsx
// Pastoral notes editor - only imported and rendered when canSeePastoralNotes is true
// The parent is responsible for conditional rendering. The API enforces server-side.

'use client'

import { useState, useEffect } from 'react'
import { Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { usePastoralNotes, useSavePastoralNotes } from '@/hooks/admin/useMembers'

interface PastoralNotesSectionProps {
  memberId:   string
  memberName: string
}

export default function PastoralNotesSection({
  memberId,
  memberName,
}: PastoralNotesSectionProps) {
  const { data, isLoading } = usePastoralNotes(memberId)
  const { mutate: saveNotes, isPending, isSuccess, isError } = useSavePastoralNotes()

  const [draft,   setDraft]   = useState('')
  const [isDirty, setIsDirty] = useState(false)

  // Sync draft when server data loads
  useEffect(() => {
    if (data?.notes !== undefined) {
      setDraft(data.notes)
      setIsDirty(false)
    }
  }, [data?.notes])

  function handleChange(val: string) {
    setDraft(val)
    setIsDirty(val !== (data?.notes ?? ''))
  }

  function handleSave() {
    saveNotes(
      { id: memberId, notes: draft },
      { onSuccess: () => setIsDirty(false) }
    )
  }

  return (
    <div className="mt-6 rounded-xl border border-[#B8860B]/20 bg-[#0A0F1E] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5
                      border-b border-[#B8860B]/15 bg-[#0D1220]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#B8860B]/10 border border-[#B8860B]/20
                          flex items-center justify-center">
            <Lock size={13} className="text-[#B8860B]" />
          </div>
          <div>
            <p className="text-[#F5C518] text-xs font-bold uppercase tracking-widest">
              Pastoral Notes
            </p>
            <p className="text-[#334155] text-[10px] mt-0.5">
              Visible to Senior Pastor and Super Admin only
            </p>
          </div>
        </div>

        {/* Save status indicators */}
        <div className="flex items-center gap-2">
          {isSuccess && !isDirty && (
            <span className="flex items-center gap-1 text-[#22C55E] text-xs font-medium">
              <CheckCircle2 size={12} /> Saved
            </span>
          )}
          {isError && (
            <span className="flex items-center gap-1 text-[#F87171] text-xs font-medium">
              <AlertCircle size={12} /> Error saving
            </span>
          )}
          {isDirty && (
            <span className="text-[#64748B] text-xs">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {isLoading ? (
          <div className="h-32 rounded-lg bg-[#0F1E35] animate-pulse" />
        ) : (
          <>
            <textarea
              value={draft}
              onChange={e => handleChange(e.target.value)}
              placeholder={`Confidential pastoral notes for ${memberName}. These notes are never shared with the member or other staff.`}
              rows={6}
              className="w-full bg-[#0F1E35] border border-white/5 rounded-xl
                         px-4 py-3 text-sm text-white/80 leading-relaxed
                         placeholder:text-[#334155]
                         focus:outline-none focus:border-[#B8860B]/40
                         focus:bg-[#0D1628] resize-none transition-all duration-200"
            />

            <div className="flex items-center justify-between mt-3">
              <p className="text-[#334155] text-xs">
                {data?.updatedAt
                  ? `Last updated ${new Date(data.updatedAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}`
                  : 'No notes saved yet'
                }
              </p>

              <button
                onClick={handleSave}
                disabled={!isDirty || isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg
                            text-xs font-bold transition-all duration-200
                            ${isDirty && !isPending
                              ? 'bg-[#B8860B] text-[#0A0F1E] hover:bg-[#F5C518]'
                              : 'bg-white/5 text-[#334155] cursor-not-allowed'
                            }`}
              >
                <Save size={12} />
                {isPending ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}