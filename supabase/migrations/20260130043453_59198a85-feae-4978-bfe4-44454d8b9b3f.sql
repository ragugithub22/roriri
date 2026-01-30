-- Add payment_amount column to industrial_visit_registrations table
ALTER TABLE public.industrial_visit_registrations
ADD COLUMN payment_amount NUMERIC DEFAULT 0;