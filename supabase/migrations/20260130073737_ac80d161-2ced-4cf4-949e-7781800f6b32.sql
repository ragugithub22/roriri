-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Assignees can view their assigned tasks" ON public.trainer_task_assignments;

-- Create a function to get the original_id from JWT user metadata
CREATE OR REPLACE FUNCTION public.get_user_original_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'original_id')::uuid,
    auth.uid()
  )
$$;

-- Create a restrictive policy that allows:
-- 1. Trainers to see tasks they assigned (trainer_id matches their profile)
-- 2. Assignees to see only tasks assigned to them (assignee_id matches their original_id)
CREATE POLICY "Users can view their own relevant tasks" 
ON public.trainer_task_assignments 
FOR SELECT 
USING (
  trainer_id = auth.uid() 
  OR assignee_id = public.get_user_original_id()
);