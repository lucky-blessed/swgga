// src/lib/auth/permissions.ts
// Helper to check if a user has access based on role OR granted permission override
// Used by API routes to support per-user permission grants from RBAC settings

import { createServiceClient } from '@/lib/supabase/server'

/**
 * Check if a user has a specific permission.
 * Returns true if:
 * - Their role is in the allowed roles list, OR
 * - They have a granted permission override in user_permissions table
 */
export async function userHasPermission(
  userId: string,
  role: string,
  allowedRoles: string[],
  permissionKey: string
): Promise<boolean> {
  // Fast path - role is in allowed list
  if (allowedRoles.includes(role)) return true

  // Check user_permissions table for override
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('user_permissions')
      .select('granted, revoked_at')
      .eq('user_id', userId)
      .eq('permission', permissionKey)
      .single()

    return !!(data?.granted && !data?.revoked_at)
  } catch {
    return false
  }
}

/**
 * Convenience wrapper that returns a 403 response if permission is denied.
 * Returns null if permitted, or a NextResponse with 403 if not.
 */
export async function requirePermission(
  userId: string | null,
  role: string | null,
  allowedRoles: string[],
  permissionKey: string
): Promise<{ error: string; status: 403 } | null> {
  if (!userId || !role) {
    return { error: 'Unauthorized', status: 403 }
  }

  const allowed = await userHasPermission(userId, role, allowedRoles, permissionKey)
  if (!allowed) {
    return { error: 'Forbidden', status: 403 }
  }

  return null
}
