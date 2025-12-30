-- Add reply column to academy_complaints table for storing admin responses
ALTER TABLE public.academy_complaints 
ADD COLUMN IF NOT EXISTS reply TEXT;