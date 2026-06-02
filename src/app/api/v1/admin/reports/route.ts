// src/app/api/v1/admin/reports/route.ts
// Weekly reports — GET list, POST create/save draft
// Fixed: draft action no longer submits the report

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const SUBMITTER_ROLES = ['R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']
const REVIEWER_ROLES  = ['R01', 'R02']
const ALL_ACCESS      = [...REVIEWER_ROLES, ...SUBMITTER_ROLES]

export async function GET(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !ALL_ACCESS.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const page        = Math.max(1,  parseInt(searchParams.get('page')   ?? '1'))
  const limit       = Math.min(50, parseInt(searchParams.get('limit')  ?? '20'))
  const offset      = (page - 1) * limit
  const status      = searchParams.get('status')      ?? 'all'
  const reportType  = searchParams.get('report_type') ?? 'all'
  const weekOf      = searchParams.get('week_of')     ?? null

  const supabase = await createServiceClient()

  let query = supabase
    .from('weekly_reports')
    .select(`
      id, title, week_of, status, report_type,
      attendance_count, activities_summary, successes, challenges,
      prayer_items, upcoming_plans, remarks,
      attachment_url, attachment_name,
      submitted_at, reviewed_at, created_at, updated_at,
      submitted_by, target_reviewer_id,
      submitter:users!weekly_reports_submitted_by_fkey (
        id, role,
        members ( first_name, last_name, occupation )
      ),
      ministry:ministries!weekly_reports_ministry_id_fkey ( id, name, slug )
    `, { count: 'exact' })

  // Role-based filtering
  if (REVIEWER_ROLES.includes(role)) {
    // R01/R02 see all reports
  } else if (['R03', 'R04'].includes(role)) {
    // Dept heads see: their own reports + unit reports targeted at them
    query = query.or(`submitted_by.eq.${userId},target_reviewer_id.eq.${userId}`)
  } else {
    // Unit heads see only their own reports
    query = query.eq('submitted_by', userId!)
  }

  if (status     !== 'all') query = query.eq('status',      status)
  if (reportType !== 'all') query = query.eq('report_type', reportType)
  if (weekOf)               query = query.eq('week_of',     weekOf)

  query = query
    .order('week_of',    { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[reports GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }

  const reports = (data ?? []).map((r: any) => {
    const sm = r.submitter?.members as any
    return {
      id:                r.id,
      title:             r.title,
      week_of:           r.week_of,
      status:            r.status,
      report_type:       r.report_type,
      attendance_count:  r.attendance_count,
      activities_summary: r.activities_summary,
      successes:         r.successes,
      challenges:        r.challenges,
      prayer_items:      r.prayer_items,
      upcoming_plans:    r.upcoming_plans,
      remarks:           r.remarks,
      attachment_url:    r.attachment_url,
      attachment_name:   r.attachment_name,
      submitted_at:      r.submitted_at,
      created_at:        r.created_at,
      updated_at:        r.updated_at,
      submitted_by:      r.submitted_by,
      submitter_name:    sm ? `${sm.first_name} ${sm.last_name}`.trim() : 'Unknown',
      submitter_role:    r.submitter?.role,
      submitter_unit:    sm?.occupation ?? null,
      ministry_name:     r.ministry?.name ?? null,
    }
  })

  return NextResponse.json({ reports, total: count ?? 0, page, limit })
}

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !SUBMITTER_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  if (!body.week_of) {
    return NextResponse.json({ error: 'Week of date is required' }, { status: 400 })
  }

  // FIX: Strictly separate draft vs submit — 'draft' NEVER submits
  const action     = body.action
  const isSubmit   = action === 'submit'
  const isDraft    = action === 'draft'

  if (!isSubmit && !isDraft) {
    return NextResponse.json({ error: 'action must be "draft" or "submit"' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Fetch user's ministry + determine target reviewer
  const { data: user } = await supabase
    .from('users')
    .select('ministry_id, role')
    .eq('id', userId!)
    .single()

  // For unit heads, find their dept head as target reviewer
  let targetReviewerId: string | null = null
  if (['R05', 'R06', 'R07', 'R08', 'R09'].includes(role) && user?.ministry_id) {
    const { data: deptHead } = await supabase
      .from('users')
      .select('id')
      .in('role', ['R03', 'R04'])
      .eq('ministry_id', user.ministry_id)
      .limit(1)
      .single()
    targetReviewerId = deptHead?.id ?? null
  }

  // For dept heads, target reviewer is R02 (Senior Pastor)
  if (['R03', 'R04'].includes(role)) {
    const { data: pastor } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'R02')
      .limit(1)
      .single()
    targetReviewerId = pastor?.id ?? null
  }

  const reportType = ['R03', 'R04'].includes(role) ? 'department' : 'unit'

  const reportData: any = {
    submitted_by:         userId,
    ministry_id:          user?.ministry_id ?? null,
    department_id:        user?.ministry_id ?? null,
    target_reviewer_id:   targetReviewerId,
    report_type:          body.report_type ?? reportType,
    title:                body.title?.trim() || `Weekly Report - Week of ${body.week_of}`,
    week_of:              body.week_of,
    attendance_count:     body.attendance_count ?? null,
    activities_summary:   body.activities_summary?.trim() ?? null,
    successes:            body.successes?.trim() ?? null,
    challenges:           body.challenges?.trim() ?? null,
    prayer_items:         body.prayer_items?.trim() ?? null,
    upcoming_plans:       body.upcoming_plans?.trim() ?? null,
    remarks:              body.remarks?.trim() ?? null,
    attachment_url:       body.attachment_url ?? null,
    attachment_name:      body.attachment_name ?? null,
    attachment_public_id: body.attachment_public_id ?? null,
    // FIX: Only set submitted status when action === 'submit'
    status:               isSubmit ? 'submitted' : 'draft',
    submitted_at:         isSubmit ? new Date().toISOString() : null,
    updated_at:           new Date().toISOString(),
  }

  // Upsert — one report per person per week
  const { data: report, error } = await supabase
    .from('weekly_reports')
    .upsert(reportData, { onConflict: 'submitted_by,week_of' })
    .select('id, status')
    .single()

  if (error || !report) {
    console.error('[reports POST]', error?.message)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }

  // Save version snapshot on every save (draft or submit)
  const { data: lastVersion } = await supabase
    .from('report_versions')
    .select('version_number')
    .eq('report_id', report.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()

  await supabase.from('report_versions').insert({
    report_id:          report.id,
    version_number:     (lastVersion?.version_number ?? 0) + 1,
    title:              reportData.title,
    attendance_count:   reportData.attendance_count,
    activities_summary: reportData.activities_summary,
    successes:          reportData.successes,
    challenges:         reportData.challenges,
    prayer_items:       reportData.prayer_items,
    upcoming_plans:     reportData.upcoming_plans,
    remarks:            reportData.remarks,
    attachment_url:     reportData.attachment_url,
    attachment_name:    reportData.attachment_name,
    saved_by:           userId,
  })

  return NextResponse.json({
    success:   true,
    report_id: report.id,
    status:    report.status,
  }, { status: 201 })
}
