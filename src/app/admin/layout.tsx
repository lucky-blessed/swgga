'use client'
// src/app/admin/layout.tsx
// Root layout for the entire admin platform
// Composes: AdminProvider → AdminSidebar + AdminTopbar + page content
// RBAC guard is enforced at two levels:
//   1. proxy.ts (server) — redirects non-admin roles before page loads
//   2. AdminProvider (client) — role-filters navigation items

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdminProvider } from '@/components/admin/providers/AdminProvider'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminTopbar from '@/components/admin/layout/AdminTopbar'
import { Toaster } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ADMIN_AUTH_PATHS = ['/admin/login', '/admin/set-password']
  if (ADMIN_AUTH_PATHS.some(p => pathname.startsWith(p))) return <>{children}</>
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AdminProvider>
      {/* Full-screen dark shell */}
      <div className="flex h-screen w-screen overflow-hidden bg-[#060E1A] text-white">

        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCollapse={() => setCollapsed(c => !c)}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Right panel — topbar + scrollable content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Top navigation bar */}
          <AdminTopbar onMobileOpen={() => setMobileOpen(true)} />

          {/* Page content — scrollable */}
          <main className="flex-1 overflow-y-auto bg-[#060E1A]">
            <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>

        </div>
      </div>

      {/* Toast notifications — Sonner */}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0F172A',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#F1F5F9',
          },
        }}
      />
    </AdminProvider>
  )
}
