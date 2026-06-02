'use client'
// src/app/admin/reports/page.tsx
// Routes to the correct view based on user role

import { useAdminUser } from '@/components/admin/providers/AdminProvider'
import SeniorPastorView from './views/SeniorPastorView'
import DeptHeadView     from './views/DeptHeadView'
import UnitHeadView     from './views/UnitHeadView'

export default function ReportsPage() {
  const { user, loading } = useAdminUser()

  if (loading || !user) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-white/5 rounded-xl w-48" />
        <div className="h-4 bg-white/5 rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[#0A1628] border border-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const { role, id: userId } = user

  // R01, R02 — Senior Pastor / Super Admin
  if (['R01', 'R02'].includes(role)) {
    return <SeniorPastorView userId={userId} role={role} />
  }

  // R03, R04 — Department Heads
  if (['R03', 'R04'].includes(role)) {
    return <DeptHeadView userId={userId} role={role} />
  }

  // R05–R09 — Unit Heads
  if (['R05', 'R06', 'R07', 'R08', 'R09'].includes(role)) {
    return <UnitHeadView userId={userId} role={role} />
  }

  // Fallback for any other role
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <p className="text-gray-500 text-sm">You do not have access to the Reports section.</p>
    </div>
  )
}
