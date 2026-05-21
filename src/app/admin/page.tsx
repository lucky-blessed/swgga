// src/app/admin/page.tsx
// Admin dashboard — placeholder until Task 2
// Shows a clean welcome screen with quick setup status

import { LayoutDashboard } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A]/20 border border-[#1E3A8A]/30 flex items-center justify-center mb-2">
        <LayoutDashboard size={28} className="text-[#93C5FD]" />
      </div>
      <h1 className="text-white font-bold text-2xl">Admin Dashboard</h1>
      <p className="text-[#64748B] text-sm max-w-sm">
        Dashboard metrics, charts, and widgets will be built in Task 2.
        The layout, sidebar, and RBAC system are fully operational.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          'Sidebar ✓', 'RBAC Guard ✓', 'Role Navigation ✓',
          'Breadcrumbs ✓', 'Notifications ✓', 'Dark Theme ✓',
          'Mobile Responsive ✓', 'Collapse Toggle ✓',
        ].map(item => (
          <span key={item} className="bg-[#0F172A] border border-white/5 text-[#64748B] text-xs px-3 py-1.5 rounded-full">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
