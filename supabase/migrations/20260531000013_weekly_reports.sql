-- Migration: Weekly reports system
-- Date: 2026-05-31
-- Tables: weekly_reports, report_versions, report_feedback

-- Main reports table
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  submitted_by    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ministry_id     uuid        REFERENCES public.ministries(id) ON DELETE SET NULL,
  week_of         date        NOT NULL,
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','submitted','reviewed','resubmission_requested','resubmitted')),
  -- Report fields
  attendance_count      integer,
  activities_summary    text,
  successes             text,
  challenges            text,
  prayer_items          text,
  upcoming_plans        text,
  remarks               text,
  -- Excel attachment
  attachment_url        text,
  attachment_name       text,
  attachment_public_id  text,
  -- Metadata
  submitted_at    timestamptz,
  reviewed_at     timestamptz,
  reviewed_by     uuid        REFERENCES public.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  -- One report per person per week
  UNIQUE (submitted_by, week_of)
);

-- Version history table — stores snapshots on every edit/resubmission
CREATE TABLE IF NOT EXISTS public.report_versions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       uuid        NOT NULL REFERENCES public.weekly_reports(id) ON DELETE CASCADE,
  version_number  integer     NOT NULL DEFAULT 1,
  title           text,
  attendance_count      integer,
  activities_summary    text,
  successes             text,
  challenges            text,
  prayer_items          text,
  upcoming_plans        text,
  remarks               text,
  attachment_url        text,
  attachment_name       text,
  saved_by        uuid        NOT NULL REFERENCES public.users(id),
  saved_at        timestamptz NOT NULL DEFAULT now()
);

-- Feedback table — R01/R02 feedback per report
CREATE TABLE IF NOT EXISTS public.report_feedback (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       uuid        NOT NULL REFERENCES public.weekly_reports(id) ON DELETE CASCADE,
  feedback_by     uuid        NOT NULL REFERENCES public.users(id),
  message         text        NOT NULL,
  allow_resubmit  boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_reports_submitted_by  ON public.weekly_reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_of       ON public.weekly_reports(week_of);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_ministry_id   ON public.weekly_reports(ministry_id);
CREATE INDEX IF NOT EXISTS idx_report_versions_report_id    ON public.report_versions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_feedback_report_id    ON public.report_feedback(report_id);

-- RLS
ALTER TABLE public.weekly_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_feedback ENABLE ROW LEVEL SECURITY;

-- weekly_reports: submitter sees own, R01/R02 see all, dept heads see their unit reports
CREATE POLICY "weekly_reports_access"
  ON public.weekly_reports FOR ALL
  USING (
    submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('R01', 'R02', 'R03', 'R04')
    )
  );

-- report_versions: same access as parent report
CREATE POLICY "report_versions_access"
  ON public.report_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_reports r
      WHERE r.id = report_id
      AND (
        r.submitted_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role IN ('R01', 'R02', 'R03', 'R04')
        )
      )
    )
  );

-- report_feedback: R01/R02 write, submitter reads own
CREATE POLICY "report_feedback_access"
  ON public.report_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('R01', 'R02')
    )
    OR EXISTS (
      SELECT 1 FROM public.weekly_reports r
      WHERE r.id = report_id AND r.submitted_by = auth.uid()
    )
  );

COMMENT ON TABLE public.weekly_reports  IS 'Weekly department/unit reports submitted by R03-R09';
COMMENT ON TABLE public.report_versions IS 'Version history snapshots for weekly reports';
COMMENT ON TABLE public.report_feedback IS 'Senior Pastor/Super Admin feedback on reports';
