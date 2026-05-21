'use client'
// AdminTopbar.tsx
// Top navigation bar — hamburger, breadcrumb, notifications, profile dropdown

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Bell, ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { useAdminUser, getRoleLabel, ROLE_COLORS } from '../providers/AdminProvider'

interface AdminTopbarProps {
  onMobileOpen: () => void
}

// Map pathnames to human-readable breadcrumb labels
const PATH_LABELS: Record<string, string> = {
  admin:        'Dashboard',
  members:      'Members',
  attendance:   'Attendance',
  giving:       'Giving Records',
  media:        'Media Library',
  events:       'Events',
  prayer:       'Prayer Queue',
  announcements:'Announcements',
  conference:   'Conference Room',
  audit:        'Audit Logs',
  security:     'RBAC & Security',
  new:          'New',
  edit:         'Edit',
}

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Build breadcrumb items
  const crumbs = segments.map((seg, i) => ({
    label: PATH_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    href:  '/' + segments.slice(0, i + 1).join('/'),
  }))

  return (
    <nav className="hidden sm:flex items-center gap-1.5 text-xs">
      <Link href="/admin" className="text-[#475569] hover:text-white transition-colors">
        <Home size={13} />
      </Link>
      {crumbs.slice(1).map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-[#334155]" />
          {i === crumbs.length - 2 ? (
            <span className="text-white font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-[#475569] hover:text-white transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

// Mock notification count — will be Redis-backed in Task 2
const MOCK_NOTIFICATIONS = 3

export default function AdminTopbar({ onMobileOpen }: AdminTopbarProps) {
  const { user } = useAdminUser()
  const [showProfile, setShowProfile] = useState(false)
  const roleColor = user ? (ROLE_COLORS[user.role] || ROLE_COLORS['R05']) : ROLE_COLORS['R05']

  return (
    <header className="h-14 bg-[#0A1628] border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 z-10">

      {/* Left — hamburger + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileOpen}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#64748B] hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu size={18} />
        </button>
        <Breadcrumbs />
      </div>

      {/* Right — notifications + profile */}
      <div className="flex items-center gap-2">

        {/* Notifications bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[#64748B] hover:text-white hover:bg-white/5 transition-all">
          <Bell size={17} />
          {MOCK_NOTIFICATIONS > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#B8860B] rounded-full flex items-center justify-center">
              <span className="text-[#0A1628] text-[9px] font-bold leading-none">
                {MOCK_NOTIFICATIONS}
              </span>
            </span>
          )}
        </button>

        {/* Role badge */}
        {user && (
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${roleColor.bg} ${roleColor.text}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {getRoleLabel(user.role)}
          </div>
        )}

        {/* Profile avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-[#0A1628] transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #B8860B, #F5C518)' }}
          >
            {user?.initials || '??'}
          </button>

          {/* Profile dropdown */}
          {showProfile && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-10 z-20 w-52 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white text-sm font-semibold">{user?.name}</p>
                  <p className={`text-xs font-medium ${roleColor.text}`}>{user ? getRoleLabel(user.role) : ''}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/admin/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm transition-all"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm transition-all"
                  >
                    View Public Site
                  </Link>
                  <div className="my-1 border-t border-white/5" />
                  <button
                    onClick={async () => {
                      await fetch('/api/v1/auth/logout', { method: 'POST' })
                      window.location.href = '/portal/login'
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 text-sm transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
