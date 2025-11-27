-- Add password column to profiles table for display purposes
-- WARNING: Storing passwords in plain text is NOT recommended for production
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add comment explaining the security concern
COMMENT ON COLUMN public.profiles.password IS 'Password storage for display (NOT RECOMMENDED - security risk)';