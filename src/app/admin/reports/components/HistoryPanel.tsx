// src/app/admin/reports/components/HistoryPanel.tsx

import { Clock, Paperclip } from 'lucide-react'

interface Version {
  id:                 string
  version_number:     number
  title:              string
  saved_at:           string
  saved_by_name:      string
  attendance_count:   number | null
  activities_summary: string | null
  successes:          string | null
  attachment_name:    string | null
  attachment_url:     string | null
}

interface Props {
  versions: Version[]
}

export default function HistoryPanel({ versions }: Props) {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          <Clock size={20} className="text-gray-600" />
        </div>
        <p className="text-sm text-gray-500">No version history</p>
        <p className="text-xs text-gray-600">Versions are saved each time the report is edited</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />

      <div className="space-y-6">
        {versions.map((v, i) => (
          <div key={v.id} className="relative pl-11">
            {/* Timeline dot */}
            <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 transition-colors
              ${i === 0
                ? 'bg-[#1E3A8A] border-[#1E3A8A]'
                : 'bg-[#060E1A] border-white/20'
              }`} />

            <div className={`bg-[#060E1A] border rounded-xl p-4 space-y-3
              ${i === 0 ? 'border-[#1E3A8A]/30' : 'border-white/5'}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${i === 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                      Version {v.version_number}
                      {i === 0 && ' (Latest)'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white mt-0.5">{v.title}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{v.saved_by_name}</span>
                <span>·</span>
                <span>{new Date(v.saved_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}</span>
                {v.attendance_count != null && (
                  <><span>·</span><span>{v.attendance_count} attendance</span></>
                )}
              </div>

              {/* Preview */}
              {v.activities_summary && (
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {v.activities_summary}
                </p>
              )}

              {/* Attachment */}
              {v.attachment_url && (
                <a href={v.attachment_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                  <Paperclip size={11} />
                  {v.attachment_name ?? 'Attachment'}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
