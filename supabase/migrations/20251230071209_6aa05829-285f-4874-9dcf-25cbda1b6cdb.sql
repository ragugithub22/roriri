-- Drop the existing foreign key constraint on complaint_from
ALTER TABLE public.academy_complaints 
DROP CONSTRAINT IF EXISTS academy_complaints_complaint_from_fkey;

-- The complaint_from column can now accept any UUID (student or employee ID)
-- We don't add a new FK constraint since complaints can come from students (trainees) 
-- who are stored in a different table than employees