// src/app/api/v1/admin/rbac/permissions/route.ts
// Per-user permission management - R01 and R02 only
// GET:   list all admin users with their current permission overrides
// PATCH: grant or revoke a specific permission for a user

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/notifications/email'

const ALLOWED_ROLES = ['R01', 'R02']

// Permissions that can be granted/revoked per user
const GRANTABLE_PERMISSIONS = [
  { key: 'FINANCIAL_ACCESS',    label: 'Financial Access',       desc: 'View and manage giving records' },
  { key: 'MEMBER_MANAGEMENT',   label: 'Member Management',      desc: 'View and edit all member profiles' },
  { key: 'MEDIA_MANAGEMENT',    label: 'Media Management',       desc: 'Upload sermons and media content' },
  { key: 'PRAYER_CONNECT',      label: 'Prayer Queue Access',     desc: 'View and manage prayer requests' },
  { key: 'CONFERENCE_SCHEDULE', label: 'Conference Scheduling',   desc: 'Create and manage conference meetings' },
  { key: 'PASTORAL_NOTES',      label: 'Pastoral Notes',          desc: 'View confidential pastoral notes' },
  { key: 'ADMIN_MANAGEMENT',    label: 'Admin Account Management',desc: 'Create and manage admin accounts' },
  { key: 'ANALYTICS_ACCESS',    label: 'Full Analytics Access',    desc: 'Access detailed attendance analytics and charts' },
]

const ROLE_LABELS: Record<string, string> = {
  R01: 'Super Admin', R02: 'Senior Pastor', R03: 'Pastor',
  R04: 'Minister',    R05: 'Deacon',        R06: 'CTY Admin',
  R07: 'Media Lead',  R08: 'Prayer Coordinator', R09: 'Impact Leader',
}

async function sendPermissionNotification(
  to: string,
  firstName: string,
  permission: string,
  granted: boolean,
  grantorName: string
) {
  const perm = GRANTABLE_PERMISSIONS.find(p => p.key === permission)
  const permLabel = perm?.label ?? permission
  const action = granted ? 'granted' : 'revoked'
  const actionColor = granted ? '#16A34A' : '#DC2626'

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#F3F4F6;">
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#0D1B2A 0%,#1E3A8A 100%);padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Sure Word Glorious Gospel Assembly</h1>
          <p style="color:#93C5FD;margin:6px 0 0;font-size:13px;">Admin Platform - Permission Update</p>
        </div>
        <div style="padding:40px;color:#374151;line-height:1.6;">
          <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:20px;">
            Permission ${action}, ${firstName}
          </h2>
          <p style="margin:0 0 16px;">
            <strong>${grantorName}</strong> has <strong style="color:${actionColor}">${action}</strong>
            the following permission on your admin account:
          </p>
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-left:4px solid ${actionColor};
                      border-radius:4px;padding:16px 20px;margin:0 0 24px;">
            <p style="margin:0;font-weight:600;color:#1A1A1A;">${permLabel}</p>
            ${perm ? `<p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${perm.desc}</p>` : ''}
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">
            ${granted
              ? 'You now have access to this feature in the admin platform.'
              : 'You no longer have access to this feature. Contact your Senior Pastor if you believe this is an error.'
            }
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login"
               style="display:inline-block;background:#1E3A8A;color:#ffffff;text-decoration:none;
                      padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
              Go to Admin Platform
            </a>
          </div>
        </div>
        <div style="background:#F9FAFB;padding:20px 40px;text-align:center;color:#9CA3AF;font-size:12px;border-top:1px solid #E5E7EB;">
          Sure Word Glorious Gospel Assembly · Warri, Delta State, Nigeria
        </div>
      </div>
    </body>
    </html>
  `
  await sendEmail(to, `Admin Permission ${granted ? 'Granted' : 'Revoked'}: ${permLabel}`, html)
}

export async function GET(req: NextRequest) {
  const actorRole = req.headers.get('x-user-role')

  if (!actorRole || !ALLOWED_ROLES.includes(actorRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServiceClient()

  // Get all admin users (R01-R09)
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id, email, role, is_active,
      members ( first_name, last_name, occupation )
    `)
    .in('role', ['R01','R02','R03','R04','R05','R06','R07','R08','R09'])
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  // Get all permission overrides
  const { data: perms } = await supabase
    .from('user_permissions')
    .select('user_id, permission, granted, granted_at, revoked_at')

  const permMap: Record<string, Record<string, boolean>> = {}
  for (const p of perms ?? []) {
    if (!permMap[p.user_id]) permMap[p.user_id] = {}
    permMap[p.user_id][p.permission] = p.granted && !p.revoked_at
  }

  const result = (users ?? []).map((u: any) => {
    const m = u.members as any
    return {
      id:          u.id,
      email:       u.email,
      role:        u.role,
      role_label:  m?.occupation || ROLE_LABELS[u.role] || u.role,
      is_active:   u.is_active,
      name:        m ? `${m.first_name} ${m.last_name}`.trim() : 'Unknown',
      permissions: permMap[u.id] ?? {},
    }
  })

  return NextResponse.json({ users: result, grantable: GRANTABLE_PERMISSIONS })
}

export async function PATCH(req: NextRequest) {
  const actorRole = req.headers.get('x-user-role')
  const actorId   = req.headers.get('x-user-id')

  if (!actorRole || !ALLOWED_ROLES.includes(actorRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.user_id || !body?.permission || typeof body?.granted !== 'boolean') {
    return NextResponse.json({ error: 'user_id, permission, and granted are required' }, { status: 400 })
  }

  const { user_id, permission, granted, notes } = body

  if (!GRANTABLE_PERMISSIONS.find(p => p.key === permission)) {
    return NextResponse.json({ error: 'Invalid permission key' }, { status: 400 })
  }

  // R02 cannot modify R01's permissions
  const supabase = await createServiceClient()

  const { data: targetUser } = await supabase
    .from('users')
    .select('id, email, role, members ( first_name, last_name )')
    .eq('id', user_id)
    .single()

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (actorRole === 'R02' && (targetUser as any).role === 'R01') {
    return NextResponse.json({ error: 'Cannot modify Super Admin permissions' }, { status: 403 })
  }

  // Upsert permission
  const { error } = await supabase
    .from('user_permissions')
    .upsert({
      user_id,
      permission,
      granted,
      granted_by:  actorId,
      granted_at:  new Date().toISOString(),
      revoked_at:  granted ? null : new Date().toISOString(),
      revoked_by:  granted ? null : actorId,
      notes:       notes ?? null,
    }, { onConflict: 'user_id,permission' })

  if (error) {
    console.error('[rbac/permissions PATCH]', error.message)
    return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 })
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id:      actorId,
    action:        granted ? 'GRANT_PERMISSION' : 'REVOKE_PERMISSION',
    resource_type: 'user_permission',
    resource_id:   user_id,
    metadata:      JSON.stringify({ permission, granted, notes }),
  })

  // Fetch actor name for notification
  const { data: actor } = await supabase
    .from('members')
    .select('first_name, last_name')
    .eq('id', actorId)
    .single()

  const actorName = actor ? `${actor.first_name} ${actor.last_name}`.trim() : 'Church Administration'

  // Send notification email to the affected user
  const tu = targetUser as any
  const tm = tu.members as any
  try {
    if (tu.email) {
      await sendPermissionNotification(
        tu.email,
        tm?.first_name ?? 'Admin',
        permission,
        granted,
        actorName
      )
    }
  } catch (emailErr) {
    console.error('[rbac/permissions] notification error:', emailErr)
  }

  return NextResponse.json({ success: true })
}
