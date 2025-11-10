-- Add date of birth column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob date;