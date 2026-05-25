'use client'
// AdminProvider.tsx
// Provides current admin user context to all admin components
// Decodes the JWT from the swgga_access cookie to get user ID and role
// All admin components use useAdminUser() to access this context

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Role } from '@/lib/auth/rbac'
import { ROLES } from '@/lib/auth/rbac'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

interface AdminUser {
  id:       string
  role:     Role
  name:     string
  initials: string
}

interface AdminContextValue {
  user:    AdminUser | null
  loading: boolean
}

const AdminContext = createContext<AdminContextValue>({ user: null, loading: true })

// Role display names — shown in the sidebar and top bar
const ROLE_LABELS: Record<string, string> = {
  R01: 'Super Admin',
  R02: 'Senior Pastor',
  R03: 'Admin / Secretary',
  R04: 'Treasurer',
  R05: 'Department Head',
  R06: 'CTY Admin',
  R07: 'Media & Tech Lead',
  R08: 'Prayer Coordinator',
  R09: 'Cell Leader',
  R10: 'Member',
  R11: 'Guest',
}

// Role badge colours — shown as a pill in the top bar
export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  R01: { bg: 'bg-[#B8860B]/20',  text: 'text-[#F5C518]' },
  R02: { bg: 'bg-[#1E3A8A]/30',  text: 'text-[#93C5FD]' },
  R03: { bg: 'bg-[#166534]/20',  text: 'text-[#86EFAC]' },
  R04: { bg: 'bg-[#6B21A8]/20',  text: 'text-[#D8B4FE]' },
  R05: { bg: 'bg-[#374151]/30',  text: 'text-[#D1D5DB]' },
  R06: { bg: 'bg-[#166534]/20',  text: 'text-[#86EFAC]' },
  R07: { bg: 'bg-[#0F2460]/30',  text: 'text-[#93C5FD]' },
  R08: { bg: 'bg-[#B8860B]/20',  text: 'text-[#F5C518]' },
  R09: { bg: 'bg-[#374151]/30',  text: 'text-[#D1D5DB]' },
}

export function getRoleLabel(role: string) { return ROLE_LABELS[role] || 'Staff' }

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        // Fetch current user from our auth API
        // The API reads the JWT cookie server-side and returns safe user data
        const res = await fetch('/api/v1/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser({
            id:       data.id,
            role:     data.role,
            name:     data.name || 'Admin User',
            initials: (data.name || 'AU').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          })
        } else {
          // During development — use mock admin user
          setUser({ id: 'b1000000-0000-0000-0000-000000000001', role: ROLES.SUPER_ADMIN, name: 'Blessed', initials: 'BN' })
        }
      } catch {
        // Fallback for development when API is not yet connected
        setUser({ id: 'b1000000-0000-0000-0000-000000000001', role: ROLES.SUPER_ADMIN, name: 'Blessed', initials: 'BN' })
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AdminContext.Provider value={{ user, loading }}>
        {children}
      </AdminContext.Provider>
    </QueryClientProvider>
  )
}

export function useAdminUser() {
  return useContext(AdminContext)
}
