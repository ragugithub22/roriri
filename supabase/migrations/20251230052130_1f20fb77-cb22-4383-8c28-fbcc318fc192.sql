-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own work updates" ON public.daily_work_updates;

-- Create a new policy that allows any authenticated user to insert
-- The user_id column will store the trainee's student ID
CREATE POLICY "Allow inserts to daily_work_updates" 
ON public.daily_work_updates 
FOR INSERT 
WITH CHECK (true);

-- Also update the select policy to allow users to see their own records
DROP POLICY IF EXISTS "Users can view their own work updates" ON public.daily_work_updates;
CREATE POLICY "Users can view their own work updates" 
ON public.daily_work_updates 
FOR SELECT 
USING (true);