// src/app/api/v1/admin/reports/[id]/route.ts
// Single report - GET detail with versions + feedback, PATCH status/feedback

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/notifications/email'

const REVIEWER_ROLES  = ['R01', 'R02']
const SUBMITTER_ROLES = ['R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')
  const { id } = await params

  if (!role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServiceClient()

  const { data: report, error } = await supabase
    .from('weekly_reports')
    .select(`
      *,
      submitter:users!weekly_reports_submitted_by_fkey (
        id, role, email,
        members ( first_name, last_name, occupation )
      ),
      ministry:ministries ( id, name, slug )
    `)
    .eq('id', id)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // Access check - only submitter or reviewer can view
  const isReviewer  = REVIEWER_ROLES.includes(role)
  const isSubmitter = (report as any).submitted_by === userId

  if (!isReviewer && !isSubmitter) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch version history
  const { data: versions } = await supabase
    .from('report_versions')
    .select(`
      id, version_number, title, attendance_count,
      activities_summary, successes, challenges,
      prayer_items, upcoming_plans, remarks,
      attachment_url, attachment_name, saved_at,
      saver:users!report_versions_saved_by_fkey (
        members ( first_name, last_name )
      )
    `)
    .eq('report_id', id)
    .order('version_number', { ascending: false })

  // Fetch feedback
  const { data: feedback } = await supabase
    .from('report_feedback')
    .select(`
      id, message, allow_resubmit, created_at,
      reviewer:users!report_feedback_feedback_by_fkey (
        members ( first_name, last_name )
      )
    `)
    .eq('report_id', id)
    .order('created_at', { ascending: false })

  const sm = (report as any).submitter?.members as any

  return NextResponse.json({
    report: {
      ...(report as any),
      submitter_name: sm ? `${sm.first_name} ${sm.last_name}`.trim() : 'Unknown',
      submitter_unit: sm?.occupation ?? null,
    },
    versions: (versions ?? []).map((v: any) => ({
      ...v,
      saved_by_name: v.saver?.members
        ? `${v.saver.members.first_name} ${v.saver.members.last_name}`.trim()
        : 'Unknown',
    })),
    feedback: (feedback ?? []).map((f: any) => ({
      ...f,
      reviewer_name: f.reviewer?.members
        ? `${f.reviewer.members.first_name} ${f.reviewer.members.last_name}`.trim()
        : 'Unknown',
    })),
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')
  const { id } = await params

  if (!role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const supabase = await createServiceClient()

  // --- Reviewer actions: feedback + mark reviewed ---
  if (REVIEWER_ROLES.includes(role)) {
    if (body.action === 'feedback') {
      if (!body.message?.trim()) {
        return NextResponse.json({ error: 'Feedback message required' }, { status: 400 })
      }

      // Save feedback
      await supabase.from('report_feedback').insert({
        report_id:      id,
        feedback_by:    userId,
        message:        body.message.trim(),
        allow_resubmit: body.allow_resubmit ?? false,
      })

      // Update report status — only change if meaningful
      // Allow multiple feedbacks: reviewed -> resubmission_requested -> resubmitted -> reviewed etc.
      const { data: currentReport } = await supabase
        .from('weekly_reports')
        .select('status')
        .eq('id', id)
        .single()

      let newStatus = currentReport?.status ?? 'reviewed'
      if (body.allow_resubmit) {
        newStatus = 'resubmission_requested'
      } else if (['submitted', 'resubmitted'].includes(newStatus)) {
        newStatus = 'reviewed'
      }

      await supabase
        .from('weekly_reports')
        .update({ status: newStatus, reviewed_at: new Date().toISOString(), reviewed_by: userId })
        .eq('id', id)

      // Notify submitter
      const { data: report } = await supabase
        .from('weekly_reports')
        .select('title, submitted_by, submitter:users!weekly_reports_submitted_by_fkey(email, members(first_name))')
        .eq('id', id)
        .single()

      if (report) {
        const r = report as any
        const submitterEmail = r.submitter?.email
        const firstName      = r.submitter?.members?.first_name ?? 'Admin'

        const { data: reviewer } = await supabase
          .from('members')
          .select('first_name, last_name')
          .eq('id', userId)
          .single()

        const reviewerName = reviewer
          ? `${reviewer.first_name} ${reviewer.last_name}`.trim()
          : 'Senior Pastor'

        if (submitterEmail) {
          const html = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#1E3A8A;padding:24px;text-align:center;">
                <h2 style="color:#fff;margin:0;">Sure Word Glorious Gospel Assembly</h2>
                <p style="color:#93C5FD;margin:6px 0 0;">Weekly Report Feedback</p>
              </div>
              <div style="padding:32px;color:#374151;">
                <p>Hi ${firstName},</p>
                <p><strong>${reviewerName}</strong> has reviewed your report: <strong>${r.title}</strong></p>
                <div style="background:#F9FAFB;border-left:4px solid #1E3A8A;padding:16px;margin:16px 0;border-radius:4px;">
                  <p style="margin:0;">${body.message.trim()}</p>
                </div>
                ${body.allow_resubmit
                  ? '<p style="color:#D97706;font-weight:600;">You have been granted permission to edit and resubmit this report.</p>'
                  : ''}
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reports"
                   style="display:inline-block;background:#1E3A8A;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
                  View Report
                </a>
              </div>
            </div>
          `
          await sendEmail(submitterEmail, `Report Feedback: ${r.title}`, html).catch(console.error)
        }
      }

      return NextResponse.json({ success: true })
    }
  }

  // --- Submitter actions: resubmit ---
  if (SUBMITTER_ROLES.includes(role) && body.action === 'resubmit') {
    // Check permission
    const { data: report } = await supabase
      .from('weekly_reports')
      .select('status, submitted_by')
      .eq('id', id)
      .single()

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    if ((report as any).submitted_by !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if ((report as any).status !== 'resubmission_requested') {
      return NextResponse.json({ error: 'Resubmission not permitted' }, { status: 400 })
    }

    const updateData: any = {
      status:       'resubmitted',
      submitted_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }

    const fields = [
      'title', 'attendance_count', 'activities_summary', 'successes',
      'challenges', 'prayer_items', 'upcoming_plans', 'remarks',
      'attachment_url', 'attachment_name', 'attachment_public_id',
    ]
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f]
    }

    await supabase.from('weekly_reports').update(updateData).eq('id', id)

    // Save new version
    const { data: lastV } = await supabase
      .from('report_versions')
      .select('version_number')
      .eq('report_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    await supabase.from('report_versions').insert({
      report_id:          id,
      version_number:     (lastV?.version_number ?? 0) + 1,
      title:              updateData.title,
      attendance_count:   updateData.attendance_count,
      activities_summary: updateData.activities_summary,
      successes:          updateData.successes,
      challenges:         updateData.challenges,
      prayer_items:       updateData.prayer_items,
      upcoming_plans:     updateData.upcoming_plans,
      remarks:            updateData.remarks,
      attachment_url:     updateData.attachment_url,
      attachment_name:    updateData.attachment_name,
      saved_by:           userId,
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
