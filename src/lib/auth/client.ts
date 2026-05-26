// src/lib/auth/client.ts
// Client-side auth utilities
// Stores access token in memory (not localStorage) for security
// Refresh token lives in HTTP-only cookie — never accessible to JS

let _accessToken: string | null = null

export function setAccessToken(token: string) {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

export function clearAccessToken() {
  _accessToken = null
}

// Stores token in a JS-accessible cookie for SSR pages
// Access token is short-lived (8h admin / 24h member) — acceptable to cookie
export function persistAccessToken(token: string) {
  _accessToken = token
  // Set as a non-httpOnly cookie so Next.js middleware can read it
  // Short expiry matches JWT expiry
  document.cookie = `swgga_access=${token}; path=/; max-age=86400; SameSite=Strict${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`
}

export function clearPersistedToken() {
  _accessToken = null
  document.cookie = 'swgga_access=; path=/; max-age=0'
}

// Determines where to redirect after login based on role
export function getPostLoginRedirect(role: string): string {
  const adminRoles = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']
  if (adminRoles.includes(role)) return '/admin'
  return '/portal/dashboard'
}
