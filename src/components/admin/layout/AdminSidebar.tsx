'use client'
// AdminSidebar.tsx
// Collapsible sidebar with role-filtered navigation
// Desktop: persistent, collapsible to icon-only mode
// Mobile: slide-in drawer triggered by hamburger in topbar

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CalendarCheck, DollarSign,
  FolderOpen, Calendar, BookOpen, Megaphone,
  Video, ClipboardList, ShieldCheck, Flame,
  ChevronLeft, ChevronRight, LogOut, ExternalLink, X
} from 'lucide-react'
import { useAdminUser, getRoleLabel, ROLE_COLORS } from '../providers/AdminProvider'
import { PERMISSIONS } from '@/lib/auth/rbac'

interface NavItem {
  label:      string
  href:       string
  icon:       React.ElementType
  permission: keyof typeof PERMISSIONS | null // null = all admin roles
  badge?:     string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      href: '/admin',              icon: LayoutDashboard, permission: null },
  { label: 'Members',        href: '/admin/members',      icon: Users,           permission: 'MEMBER_MANAGEMENT' },
  { label: 'Attendance',     href: '/admin/attendance',   icon: CalendarCheck,   permission: null },
  { label: 'Giving Records', href: '/admin/giving',       icon: DollarSign,      permission: 'FINANCIAL_ACCESS' },
  { label: 'Media Library',  href: '/admin/media',        icon: FolderOpen,      permission: 'MEDIA_MANAGEMENT' },
  { label: 'Events',         href: '/admin/events',       icon: Calendar,        permission: null },
  { label: 'Prayer Queue',   href: '/admin/prayer',       icon: BookOpen,        permission: 'PRAYER_CONNECT' },
  { label: 'Announcements',  href: '/admin/announcements',icon: Megaphone,       permission: null },
  { label: 'Conference Room',href: '/admin/conference',   icon: Video,           permission: 'CONFERENCE_SCHEDULE' },
  { label: 'Audit Logs',     href: '/admin/audit',        icon: ClipboardList,   permission: null },
  { label: 'Admin Accounts', href: '/admin/settings/accounts', icon: Users, permission: null },
  { label: 'RBAC & Security',href: '/admin/security',     icon: ShieldCheck,     permission: null },
]

interface AdminSidebarProps {
  collapsed:    boolean
  mobileOpen:   boolean
  onCollapse:   () => void
  onMobileClose:() => void
}

export default function AdminSidebar({
  collapsed, mobileOpen, onCollapse, onMobileClose
}: AdminSidebarProps) {
  const pathname        = usePathname()
  const { user, loading } = useAdminUser()

  // Filter nav items based on user role
  const visibleItems = NAV_ITEMS.filter(item => {
    if (!user) return false
    if (!item.permission) return true // visible to all admin roles
    return (PERMISSIONS[item.permission] as readonly string[]).includes(user.role)
  })

  const roleColor = user ? (ROLE_COLORS[user.role] || ROLE_COLORS['R05']) : ROLE_COLORS['R05']

  function NavLink({ item }: { item: NavItem }) {
    const Icon   = item.icon
    const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

    return (
      <Link
        href={item.href}
        onClick={onMobileClose}
        title={collapsed ? item.label : undefined}
        className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 ${
          collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'
        } ${
          active
            ? 'bg-[#1E3A8A] text-white shadow-lg shadow-[#1E3A8A]/20'
            : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
        }`}
      >
        {/* Active indicator bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#F5C518] rounded-r-full" />
        )}
        <Icon size={18} className={`flex-shrink-0 ${active ? 'text-white' : 'text-[#64748B] group-hover:text-white'}`} />
        {!collapsed && (
          <span className="text-sm font-medium truncate">{item.label}</span>
        )}
        {/* Tooltip when collapsed */}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0F172A] border border-[#1E293B] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {item.label}
          </span>
        )}
      </Link>
    )
  }

  const SidebarInner = (
    <div className="flex flex-col h-full bg-[#0A1628]">

      {/* Brand header */}
      <div className={`flex items-center border-b border-white/5 flex-shrink-0 ${
        collapsed ? 'justify-center p-3 h-14' : 'justify-between px-4 h-14'
      }`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #B8860B, #F5C518)' }}>
              <Flame size={14} className="text-[#0A1628]" />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-none">Sure Word GGA</p>
              <p className="text-[#F5C518] text-[10px] font-semibold leading-none mt-0.5">Admin Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #B8860B, #F5C518)' }}>
            <Flame size={14} className="text-[#0A1628]" />
          </div>
        )}
        {/* Mobile close button */}
        <button onClick={onMobileClose} className="lg:hidden text-[#64748B] hover:text-white p-1">
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
        {/* Public site shortcut */}
        <Link
          href="/"
          onClick={onMobileClose}
          className={`group flex items-center gap-3 rounded-xl px-3 py-2 mb-3 text-[#64748B] hover:text-[#F5C518] transition-colors ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <ExternalLink size={14} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs font-medium">View Public Site</span>}
        </Link>

        {/* Section label */}
        {!collapsed && (
          <p className="text-[#334155] text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
        )}

        {visibleItems.map(item => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* User profile card */}
      <div className="p-2 border-t border-white/5 flex-shrink-0">
        {!loading && user && (
          <div className={`flex items-center rounded-xl p-2.5 bg-white/5 ${collapsed ? 'justify-center' : 'gap-3'}`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm text-[#0A1628]"
              style={{ background: 'linear-gradient(135deg, #B8860B, #F5C518)' }}>
              {user.initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                  <p className={`text-[10px] font-medium truncate ${roleColor.text}`}>
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('swgga_token')
                    await fetch('/api/v1/auth/logout', {
                      method: 'POST',
                      headers: token ? { Authorization: 'Bearer ' + token } : {}
                    })
                    localStorage.removeItem('swgga_token')
                    document.cookie = 'swgga_access=; path=/; max-age=0'
                    document.cookie = 'swgga_refresh=; path=/; max-age=0'
                    window.location.href = '/admin/login'
                  }}
                  title="Sign out"
                  className="text-[#475569] hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onCollapse}
          className={`hidden lg:flex items-center justify-center w-full mt-2 py-1.5 rounded-xl text-[#334155] hover:text-[#64748B] hover:bg-white/5 transition-all duration-200 ${
            collapsed ? '' : 'gap-2'
          }`}
        >
          {collapsed ? <ChevronRight size={14} /> : (
            <>
              <ChevronLeft size={14} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-14' : 'w-56'
      }`}>
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl">
            {SidebarInner}
          </aside>
        </div>
      )}
    </>
  )
}
