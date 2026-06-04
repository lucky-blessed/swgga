// src/lib/auth/rbac.ts
// Role-Based Access Control definitions
// Defines permissions for all 11 roles (R01-R11) as per SRS v1.2

export const ROLES = {
    SUPER_ADMIN:            'R01',
    SENIOR_PASTOR:          'R02',
    ADMIN_SECRETARY:        'R03',
    TREASURER:              'R04',
    DEPARTMENT_HEAD:        'R05',
    CTY_ADMIN:              'R06',
    MEDIA_TECH_LEAD:        'R07',
    PRAYER_COORDINATOR:     'R08',
    IMPACT_CENTER_LEADER:   'R09',
    MEMBER:                 'R10',
    GUEST:                  'R11',
} as const


export type Role = typeof ROLES[keyof typeof ROLES]

// Permission groups - used in middleware to protect routes
export const PERMISSIONS = {
    // Who can access the admin platform at all
    ADMIN_ACCESS: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09'],

    // Who can view financial records
    FINANCIAL_ACCESS: ['R01', 'R02', 'R04'],
    // Who can manage members
    MEMBER_MANAGEMENT: ['R01', 'R02', 'R03'],

    // Who can read pastoral notes on member profiles
    PASTORAL_NOTES: ['R01', 'R02'],

    // Who can schedule conference meetings
    CONFERENCE_SCHEDULE: ['R01', 'R02'],

    // Who can upload sermons and devotionals
    MEDIA_MANAGEMENT: ['R01', 'R07'],

    // Who can see Keep Private prayer requests
    PRIVATE_PRAYER: ['R01', 'R02'],

    // Who can access Prayer Connect requests
    PRAYER_CONNECT: ['R01', 'R02'],

    // Who can access the member portal
    PORTAL_ACCESS: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10'],
  ADMIN_MANAGEMENT: ['R01', 'R02'],
  ANALYTICS_ACCESS:  ['R01', 'R02', 'R03', 'R04'],
} as const

// Helper function - checks if a role has a specific permission
export function hasPermission(role: Role, permission: keyof typeof PERMISSIONS): boolean {
    return (PERMISSIONS[permission] as readonly string[]).includes(role)
}