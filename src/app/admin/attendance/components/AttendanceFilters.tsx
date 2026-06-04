'use client'
// src/app/admin/attendance/components/AttendanceFilters.tsx

import { useState } from 'react'
import { Calendar, ChevronDown, X } from 'lucide-react'
import type { ServiceType } from '@/hooks/admin/useAttendance'

export interface FilterState {
  from:    string
  to:      string
  type:    ServiceType | 'all'
  preset:  string
}

interface Props {
  filters:   FilterState
  onChange:  (f: FilterState) => void
}

const SERVICE_TYPES = [
  { value: 'all',                 label: 'All Services'         },
  { value: 'sunday_service',      label: 'Sunday Service'       },
  { value: 'word_feast',          label: 'Word Feast'           },
  { value: 'moment_of_encounter', label: 'Moment of Encounter'  },
  { value: 'healing_streams',     label: 'Healing Streams'      },
  { value: 'special',             label: 'Special Service'      },
]

const PRESETS = [
  { value: '7d',    label: 'Last 7 days'    },
  { value: '30d',   label: 'Last 30 days'   },
  { value: '3m',    label: 'Last 3 months'  },
  { value: '6m',    label: 'Last 6 months'  },
  { value: 'year',  label: 'This Year'      },
  { value: 'custom',label: 'Custom'         },
]

function getPresetDates(preset: string): { from: string; to: string } {
  const now = new Date()
  const to  = now.toISOString().split('T')[0]
  const from = (days: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }
  const fromMonth = (months: number) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - months)
    return d.toISOString().split('T')[0]
  }
  switch (preset) {
    case '7d':   return { from: from(7),          to }
    case '30d':  return { from: from(30),         to }
    case '3m':   return { from: fromMonth(3),     to }
    case '6m':   return { from: fromMonth(6),     to }
    case 'year': return { from: `${now.getFullYear()}-01-01`, to }
    default:     return { from: '', to: '' }
  }
}

export default function AttendanceFilters({ filters, onChange }: Props) {
  const [showCustom, setShowCustom] = useState(filters.preset === 'custom')

  function setPreset(preset: string) {
    if (preset === 'custom') {
      setShowCustom(true)
      onChange({ ...filters, preset, from: '', to: '' })
    } else {
      setShowCustom(false)
      const dates = getPresetDates(preset)
      onChange({ ...filters, preset, ...dates })
    }
  }

  function clearFilters() {
    setShowCustom(false)
    onChange({ from: '', to: '', type: 'all', preset: '30d' })
  }

  const hasActiveFilters = filters.type !== 'all' || filters.from || filters.to

  return (
    <div className="py-3">
      <div className="flex flex-wrap items-center gap-3">

        {/* Preset buttons */}
        <div className="flex items-center gap-1 bg-[#0A1628] border border-white/5 rounded-xl p-1">
          {PRESETS.map(p => (
            <button key={p.value} onClick={() => setPreset(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filters.preset === p.value
                  ? 'bg-[#1E3A8A] text-white'
                  : 'text-gray-400 hover:text-white'
                }`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {showCustom && (
          <>
            <div className="flex items-center gap-2 bg-[#0A1628] border border-white/10 rounded-xl px-3 py-2">
              <Calendar size={13} className="text-gray-500" />
              <span className="text-xs text-gray-500">From:</span>
              <input type="date" value={filters.from}
                onChange={e => onChange({ ...filters, from: e.target.value })}
                className="bg-transparent text-white text-sm focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-[#0A1628] border border-white/10 rounded-xl px-3 py-2">
              <Calendar size={13} className="text-gray-500" />
              <span className="text-xs text-gray-500">To:</span>
              <input type="date" value={filters.to}
                onChange={e => onChange({ ...filters, to: e.target.value })}
                className="bg-transparent text-white text-sm focus:outline-none" />
            </div>
          </>
        )}

        {/* Service type */}
        <div className="relative">
          <select value={filters.type}
            onChange={e => onChange({ ...filters, type: e.target.value as ServiceType | 'all' })}
            className="appearance-none bg-[#0A1628] border border-white/5 rounded-xl
                       pl-3 pr-8 py-2 text-white text-sm focus:outline-none cursor-pointer">
            {SERVICE_TYPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
            <X size={13} /> Clear
          </button>
        )}
      </div>
    </div>
  )
}
