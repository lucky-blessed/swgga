-- Migration: Update service types to match actual church services
-- Date: 2026-06-04

-- Clear test data and reset to actual service types
DELETE FROM public.service_records;

-- Drop old constraint and add new one
ALTER TABLE public.service_records
  DROP CONSTRAINT IF EXISTS service_records_service_type_check;

ALTER TABLE public.service_records
  ADD CONSTRAINT service_records_service_type_check
  CHECK (service_type IN ('sunday_service', 'word_feast', 'moment_of_encounter', 'healing_streams', 'special'));
