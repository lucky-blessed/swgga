-- Migration: Reports hierarchy additions
-- Date: 2026-05-31
-- Extends weekly_reports for unit/department hierarchy

-- Add hierarchy columns to weekly_reports
ALTER TABLE public.weekly_reports
  ADD COLUMN IF NOT EXISTS report_type         text NOT NULL DEFAULT 'unit'
                                               CHECK (report_type IN ('unit', 'department')),
  ADD COLUMN IF NOT EXISTS target_reviewer_id  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id       uuid REFERENCES public.ministries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS collated_report_ids uuid[] DEFAULT '{}';

-- Extend status to include collated and approved
ALTER TABLE public.weekly_reports
  DROP CONSTRAINT IF EXISTS weekly_reports_status_check;

ALTER TABLE public.weekly_reports
  ADD CONSTRAINT weekly_reports_status_check
  CHECK (status IN (
    'draft',
    'submitted',
    'under_review',
    'resubmission_requested',
    'resubmitted',
    'collated',
    'approved'
  ));

-- Allow dept heads (R03/R04) to write feedback on unit reports
DROP POLICY IF EXISTS "report_feedback_access" ON public.report_feedback;

CREATE POLICY "report_feedback_access"
  ON public.report_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('R01', 'R02', 'R03', 'R04')
    )
    OR EXISTS (
      SELECT 1 FROM public.weekly_reports r
      WHERE r.id = report_id AND r.submitted_by = auth.uid()
    )
  );

-- Update weekly_reports policy to allow unit heads to see reports
-- submitted to their dept head (target_reviewer_id matches their dept head)
DROP POLICY IF EXISTS "weekly_reports_access" ON public.weekly_reports;

CREATE POLICY "weekly_reports_access"
  ON public.weekly_reports FOR ALL
  USING (
    -- Own reports
    submitted_by = auth.uid()
    -- R01/R02 see everything
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('R01', 'R02')
    )
    -- R03/R04 see reports targeted at them + dept reports
    OR (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('R03', 'R04')
      )
      AND (
        target_reviewer_id = auth.uid()
        OR report_type = 'department'
      )
    )
  );

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_weekly_reports_report_type
  ON public.weekly_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_target_reviewer
  ON public.weekly_reports(target_reviewer_id);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_department_id
  ON public.weekly_reports(department_id);

COMMENT ON COLUMN public.weekly_reports.report_type IS
  'unit = submitted by R05-R09 to dept head; department = submitted by R03/R04 to senior pastor';

COMMENT ON COLUMN public.weekly_reports.target_reviewer_id IS
  'Who this report is addressed to — dept head for unit reports, senior pastor for dept reports';

COMMENT ON COLUMN public.weekly_reports.collated_report_ids IS
  'Array of unit report IDs that were collated into this departmental report';
