-- Add residence_type column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS residence_type text;