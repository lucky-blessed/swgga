'use client'
// src/app/portal/layout.tsx

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, User, Play,
  CalendarDays, Home, HandIcon, Settings,
  Bell, LogOut, Menu, X,
} from 'lucide-react'
import { getAccessToken, clearPersistedToken } from '@/lib/auth/client'

// --- Portal User Context ---

interface PortalUser {
  id:          string
  name:        string
  first_name:  string | null
  email:       string | null
  phone:       string | null
  role:        string
  photo:       string | null
  word_streak: number
  ministry:    { id: string; name: string; slug: string } | null
}

const PortalUserContext = createContext<{
  user:        PortalUser | null
  loading:     boolean
  updatePhoto: (url: string) => void
}>({ user: null, loading: true, updatePhoto: () => {} })

export function usePortalUser() {
  return useContext(PortalUserContext)
}

// --- Nav Items ---

const NAV_ITEMS = [
  { href: '/portal/dashboard', label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/portal/profile',   label: 'My Profile',       icon: User            },
  { href: '/portal/sermons',   label: 'Sermons',          icon: Play            },
  { href: '/portal/events',    label: 'My Events',        icon: CalendarDays    },
  { href: '/portal/cell',      label: 'Impact Fellowship',icon: Home            },
  { href: '/portal/prayer',    label: 'Prayer Requests',  icon: HandIcon        },
  { href: '/portal/giving',    label: 'Giving',           icon: Settings        },
  { href: '/portal/settings',  label: 'Settings',         icon: Settings        },
]

// --- Layout ---

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const AUTH_PATHS = ['/portal/login', '/portal/register', '/portal/verify-email', '/portal/pending-verification', '/portal/forgot-password',
    '/portal/reset-password']
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))
  if (isAuthPage) return <>{children}</>

  const [user,          setUser]          = useState<PortalUser | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const token = getAccessToken() ??
          document.cookie.split('; ').find(r => r.startsWith('swgga_access='))?.split('=')[1]
        if (!token) { router.push('/portal/login'); return }
        const res = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) { clearPersistedToken(); router.push('/portal/login'); return }
        setUser(await res.json())
      } catch {
        router.push('/portal/login')
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // Re-check auth when user returns to tab or navigates back
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        const t = getAccessToken() ??
          document.cookie.split('; ').find(r => r.startsWith('swgga_access='))?.split('=')[1]
        if (!t) {
          clearPersistedToken()
          router.push('/portal/login')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        fetch('/api/v1/auth/me', { credentials: 'include' }).then(res => {
          if (!res.ok) {
            clearPersistedToken()
            window.location.replace('/portal/login')
          }
        }).catch(() => {
          clearPersistedToken()
          window.location.replace('/portal/login')
        })
      }
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Close avatar menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function updatePhoto(url: string) {
    setUser(u => u ? { ...u, photo: url } : u)
  }

  async function handleLogout() {
    try {
      const token = getAccessToken()
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch {}
    clearPersistedToken()
    router.push('/portal/login')
  }

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '??'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#1E3A8A] border-t-transparent animate-spin" />
          <p className="text-[#6B7280] text-sm">Loading portal...</p>
        </div>
      </div>
    )
  }

  return (
    <PortalUserContext.Provider value={{ user, loading, updatePhoto }}>
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col">

        {/* Top bar */}
        <div className="bg-gradient-to-r from-[#0F2460] to-[#1E3A8A] h-[52px]
                        flex items-center justify-between px-4 sm:px-7 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(m => !m)} className="lg:hidden text-white/70 hover:text-white">
              <Menu size={20} />
            </button>
            {/* SW logo — links to home */}
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-[#B8860B] flex items-center justify-center font-bold text-xs text-white">
                SW
              </div>
              <span className="text-white text-sm font-bold hidden sm:block" style={{ fontFamily: 'Playfair Display, serif' }}>
                Member Portal
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-white/65 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#1E3A8A]" />
            </button>

            {/* Avatar with dropdown menu */}
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setAvatarMenuOpen(o => !o)}
                className="focus:outline-none"
              >
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#B8860B]/40
                               hover:border-[#B8860B] transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B8860B] to-[#92650A]
                                  flex items-center justify-center font-bold text-xs text-white
                                  hover:opacity-80 transition-opacity">
                    {initials}
                  </div>
                )}
              </button>

              {/* Dropdown menu */}
              {avatarMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0A1628] border border-white/10
                                rounded-xl shadow-2xl overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email ?? user?.phone}</p>
                  </div>
                  {/* Actions */}
                  <div className="py-1">
                    <Link
                      href="/portal/profile"
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300
                                 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User size={15} className="text-gray-400" />
                      Edit Profile
                    </Link>
                    <Link
                      href="/portal/settings"
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300
                                 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings size={15} className="text-gray-400" />
                      Settings
                    </Link>
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button
                        onClick={() => { setAvatarMenuOpen(false); handleLogout() }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400
                                   hover:bg-red-500/10 transition-colors w-full text-left"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar desktop */}
          <aside className="w-[230px] min-w-[230px] flex-shrink-0 bg-gradient-to-b from-[#0D1B2A] to-[#152D6E] hidden lg:flex flex-col">
            <SidebarContent user={user} pathname={pathname} onLogout={handleLogout} initials={initials} />
          </aside>

          {/* Sidebar mobile */}
          {mobileOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
              <aside className="fixed left-0 top-0 h-full w-[230px] z-50 bg-gradient-to-b from-[#0D1B2A] to-[#152D6E] flex flex-col lg:hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-white text-sm font-bold">Menu</span>
                  <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <SidebarContent user={user} pathname={pathname} onLogout={handleLogout} initials={initials} onNavigate={() => setMobileOpen(false)} />
              </aside>
            </>
          )}

          <main className="flex-1 overflow-y-auto bg-[#F9FAFB]">
            {children}
          </main>
        </div>
      </div>
    </PortalUserContext.Provider>
  )
}

// --- Sidebar Content ---

function SidebarContent({
  user, pathname, onLogout, initials, onNavigate,
}: {
  user: PortalUser | null; pathname: string
  onLogout: () => void; initials: string; onNavigate?: () => void
}) {
  return (
    <>
      <div className="px-5 py-5 border-b border-white/8 mb-2">
        {user?.photo ? (
          <img
            src={user.photo}
            alt={user.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-[#B8860B]/40 mb-2.5
                       shadow-[0_0_0_3px_rgba(184,134,11,0.2)]"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#B8860B] to-[#92650A]
                          flex items-center justify-center font-bold text-sm text-white mb-2.5
                          shadow-[0_0_0_3px_rgba(184,134,11,0.2)]">
            {initials}
          </div>
        )}
        <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
          {user?.name ?? 'Member'}
        </p>
        <p className="text-white/45 text-xs mt-0.5 truncate">
          {user?.email ?? user?.phone ?? ''}
        </p>
      </div>

      <nav className="flex-1 px-0">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-all cursor-pointer
                ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/6 hover:text-white'}`}
              style={{ borderLeftWidth: '3px', borderLeftColor: isActive ? '#B8860B' : 'transparent' }}
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-0 py-2 border-t border-white/8">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 py-3 text-sm text-white/40
                     hover:text-red-400 hover:bg-white/5 transition-all w-full"
          style={{ borderLeftWidth: '3px', borderLeftColor: 'transparent' }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  )
}
