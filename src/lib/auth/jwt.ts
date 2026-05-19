// src/lib/auth/jwt.ts
// JWT creation and verification
// Tokens are used to authenticate every request after login

import jwt from 'jsonwebtoken'
import { AUTH_CONFIG } from './config'
import type { Role } from './rbac'

// Shape of the data stored inside each JWT
export interface JWTPayload {
    sub: string    // user ID
    role: Role     // user's role (R01-R11)
    jti: string    // unique token ID — used for blacklisting on logout
    iat: number    // issued at timestamp
    exp: number    // expiry timestamp
  }

// Creates a new access token for a logged-in user
export function createAccessToken(userId: string, role: Role): string {
    const isAdmin = AUTH_CONFIG.ADMIN_ROLES.includes(role as any)
    const expiry = isAdmin ? AUTH_CONFIG.JWT_EXPIRY_ADMIN : AUTH_CONFIG.JWT_EXPIRY_MEMBER

    return jwt.sign(
        {
            sub: userId,
            role: role,
            jti: crypto.randomUUID(), // unique ID for blacklisting
        },
        process.env.JWT_SECRET!,
        { expiresIn: expiry }
    )
}

// Creates a refresh token — longer lived, used to get a new access token
export function createRefreshToken(userId: string): string {
    return jwt.sign(
      { sub: userId, jti: crypto.randomUUID() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: AUTH_CONFIG.JWT_REFRESH_EXPIRY }
    )
  }


// Verifies an access token and returns its payload
// Returns null if the token is invalid or expired
export function verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    } catch {
      return null
    }
  }


// Verifies a refresh token
export function verifyRefreshToken(token: string): { sub: string, jti: string } | null {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any
    } catch {
      return null
    }
  }