// scr/lib/auth/config.ts
// Authentication configuration constants

export const AUTH_CONFIG = {
    // JWT expires in 24 hours for members, 8 hours for admin
    JWT_EXPIRY_MEMBER: '24h',
    JWT_EXPIRY_ADMIN: '8h',

    // Refresh token expiry - 30 days
    JWT_REFRESH_EXPIRY: '30d',

    // Account lockout after failed attempts
    MAX_LOGIN_ATTEMPTS: 3,
    LOCKOUT_DURATION_MINUTES: 15,

    // OTP settings
    OTP_EXPIRY_MINUTES: 10,
    OTP_LENGTH: 6,

    // Admin roles - used to determin JWt expiry and session limits
    ADMIN_ROLES: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09'],
    MEMBER_ROLES: ['R10'],
    PUBLIC_ROLES:  ['R11'],
} as const