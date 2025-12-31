-- Add address and amount columns to industrial_visit_visitors table
ALTER TABLE public.industrial_visit_visitors 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS mobile TEXT;