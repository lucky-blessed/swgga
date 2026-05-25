// src/components/admin/conference/JitsiRoom.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Video, ExternalLink } from 'lucide-react'

interface JitsiRoomProps {
  meetingId:   string
  roomId:      string
  displayName: string
  onLeave?:    () => void
}

export default function JitsiRoom({
  meetingId,
  roomId,
  displayName,
  onLeave,
}: JitsiRoomProps) {
  const iframeRef                   = useRef<HTMLIFrameElement>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [joined,     setJoined]     = useState(false)


  const jitsiUrl = `https://meet.jit.si/${roomId}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`

  const hasJoined = useRef(false)

  useEffect(() => {
    if (hasJoined.current) return
    hasJoined.current = true

    fetch(`/api/v1/admin/conference/${meetingId}/join`, { method: 'POST' })
      .then(() => setJoined(true))
      .catch(e => setError(e.message))

    return () => {
      fetch(`/api/v1/admin/conference/${meetingId}/join`, { method: 'PATCH' })
      onLeave?.()
    }
  }, [meetingId])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                        flex items-center justify-center">
          <Video size={28} className="text-red-400" />
        </div>
        <p className="text-white font-medium text-center">{error}</p>
        
          href={`https://meet.jit.si/${roomId}`}
          <a
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

      {/* Loading overlay */}
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
          <p className="text-[#334155] text-xs">Sure Word GGA · Leadership Conference</p>
        </div>
      )}

      {/* Jitsi iframe */}
      <iframe
        ref={iframeRef}
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full min-h-[600px] border-0"
        onLoad={() => setLoading(false)}
        title={`SWGGA Meeting — ${roomId}`}
      />
    </div>
  )
}