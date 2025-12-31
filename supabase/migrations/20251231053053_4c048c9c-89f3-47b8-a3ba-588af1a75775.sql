-- Add missing columns to industrial_visit_registrations table to store all visit-type-specific data
ALTER TABLE public.industrial_visit_registrations
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT;