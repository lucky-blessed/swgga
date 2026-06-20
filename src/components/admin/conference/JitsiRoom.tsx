'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Video, ExternalLink } from 'lucide-react'

interface JitsiRoomProps {
  meetingId:   string
  roomId:      string
  displayName: string
  onLeave?:    () => void
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

const SCRIPT_SRC = 'https://meet.jit.si/external_api.js'

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve()
      return
    }
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Jitsi script')))
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Jitsi script'))
    document.body.appendChild(script)
  })
}

export default function JitsiRoom({
  meetingId,
  roomId,
  displayName,
  onLeave,
}: JitsiRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef        = useRef<any>(null)
  const hasJoinedApi   = useRef(false)

  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        await loadJitsiScript()
        if (cancelled || !containerRef.current) return

        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: roomId,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        })

        apiRef.current = api

        api.addEventListener('videoConferenceJoined', () => {
          if (cancelled) return
          setLoading(false)
          if (!hasJoinedApi.current) {
            hasJoinedApi.current = true
            fetch(`/api/v1/admin/conference/${meetingId}/join`, { method: 'POST' }).catch(() => {})
          }
        })

        api.addEventListener('videoConferenceLeft', () => {
          if (cancelled) return
          fetch(`/api/v1/admin/conference/${meetingId}/join`, { method: 'PATCH' }).catch(() => {})
          onLeave?.()
        })

        api.addEventListener('readyToClose', () => {
          if (cancelled) return
          onLeave?.()
        })
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to load meeting room')
      }
    }

    init()

    return () => {
      cancelled = true
      if (apiRef.current) {
        // Dispose the Jitsi instance - this does NOT trigger onLeave,
        // it only happens on explicit user action via the Jitsi UI
        // or the parent unmounting this component deliberately.
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [meetingId, roomId, displayName, onLeave])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                        flex items-center justify-center">
          <Video size={28} className="text-red-400" />
        </div>
        <p className="text-white font-medium text-center">{error}</p>
        
          <a
          href={`https://meet.jit.si/${roomId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A8A]
                     hover:bg-[#1e40af] text-white text-sm transition-colors"
        >
          <ExternalLink size={14} /> Open in New Tab
        </a>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#060E1A] rounded-2xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center
                        bg-[#060E1A] z-10 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30
                          flex items-center justify-center">
            <Video size={28} className="text-[#1E3A8A]" />
          </div>
          <div className="flex items-center gap-2 text-[#64748B]">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Connecting to meeting room…</span>
          </div>
          <p className="text-[#334155] text-xs">Sure Word Glorious Gospel Assembly · Leadership Conference</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full min-h-[600px]" />
    </div>
  )
}
