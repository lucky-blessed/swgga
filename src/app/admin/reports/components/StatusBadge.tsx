// src/app/admin/reports/components/StatusBadge.tsx

import { Clock, Send, Eye, AlertCircle, RotateCcw, Layers, CheckCircle } from 'lucide-react'

export const STATUS_CONFIG: Record<string, {
  label: string
  color: string
  bg: string
  icon: React.ElementType
}> = {
  draft:                  { label: 'Draft',              color: 'text-gray-400',   bg: 'bg-gray-500/10 border-gray-500/20',    icon: Clock },
  submitted:              { label: 'Submitted',          color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',    icon: Send },
  under_review:           { label: 'Under Review',       color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  icon: Eye },
  resubmission_requested: { label: 'Resubmit Required',  color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20',icon: AlertCircle },
  resubmitted:            { label: 'Resubmitted',        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20',icon: RotateCcw },
  collated:               { label: 'Collated',           color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20',    icon: Layers },
  approved:               { label: 'Approved',           color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  icon: CheckCircle },
}

interface Props {
  status: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg  = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  const Icon = cfg.icon
  const px   = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${cfg.color} ${cfg.bg} ${px}`}>
      <Icon size={size === 'sm' ? 10 : 12} />
      {cfg.label}
    </span>
  )
}
