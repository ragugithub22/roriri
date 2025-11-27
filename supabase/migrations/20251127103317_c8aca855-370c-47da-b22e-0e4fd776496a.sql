-- Add username column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.username IS 'Custom username for login (optional, email can also be used)';

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;