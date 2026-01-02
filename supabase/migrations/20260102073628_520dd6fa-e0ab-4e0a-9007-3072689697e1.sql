-- Add name, address, mobile_number columns to user_login table
ALTER TABLE public.user_login
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);