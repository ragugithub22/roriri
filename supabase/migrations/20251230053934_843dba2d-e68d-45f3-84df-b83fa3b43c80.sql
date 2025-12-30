-- Drop the foreign key constraint that references auth.users
ALTER TABLE public.daily_work_updates 
DROP CONSTRAINT IF EXISTS daily_work_updates_user_id_fkey;

-- The user_id column will now accept any UUID without foreign key validation
-- This allows trainees (who are in the students table, not auth.users) to insert records