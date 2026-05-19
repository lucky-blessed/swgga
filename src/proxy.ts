// middleware.ts
// Runs on every request to protected routes before the page or API handler
// Verifies JWT, checks Redis blacklist, and enforces RBAC

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { redis } from '@/lib/db/redis'
import { PERMISSIONS } from '@/lib/auth/rbac'

// API routes that are public — no token required
const PUBLIC_API_ROUTES = [
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/refresh',
  '/api/v1/auth/otp/send',
  '/api/v1/auth/otp/verify',
  '/api/v1/health',
  '/api/v1/devotionals/rss',
  '/api/v1/prayer-connect/session',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public API routes through without any checks
  const isPublicAPI = PUBLIC_API_ROUTES.some(route =>
    pathname.startsWith(route)
  )
  if (isPublicAPI) return NextResponse.next()

  // Determine if this is a protected route
  const isProtectedPage = pathname.startsWith('/portal') ||
                          pathname.startsWith('/admin')
  const isProtectedAPI  = pathname.startsWith('/api/v1') && !isPublicAPI

  if (!isProtectedPage && !isProtectedAPI) {
    return NextResponse.next()
  }

  // Extract JWT from Authorization header (API) or cookie (pages)
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') ||
                request.cookies.get('swgga_access')?.value

  if (!token) {
    if (isProtectedPage) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Verify the JWT signature and expiry
  const payload = verifyAccessToken(token)
  if (!payload) {
    if (isProtectedPage) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Check Redis blacklist — token may have been invalidated on logout
  const isBlacklisted = await redis.get(`jwt_blacklist:${payload.jti}`)
  if (isBlacklisted) {
    if (isProtectedPage) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return NextResponse.json(
      { error: 'Token has been revoked' },
      { status: 401 }
    )
  }

  // RBAC — admin routes require an admin role
  if (pathname.startsWith('/admin')) {
    const hasAdminAccess = (PERMISSIONS.ADMIN_ACCESS as readonly string[])
      .includes(payload.role)
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // RBAC — financial routes require R01, R02, or R04
  if (pathname.includes('/giving') || pathname.includes('/financial')) {
    const hasFinancialAccess = (PERMISSIONS.FINANCIAL_ACCESS as readonly string[])
      .includes(payload.role)
    if (!hasFinancialAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Attach user info to request headers for use in API route handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.sub)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

// Apply middleware to these route patterns only
export const config = {
  matcher: [
    '/portal/:path*',
    '/admin/:path*',
    '/api/v1/:path*',
  ],
}