-- Add RLS policy to allow assignees (trainees/interns) to view tasks assigned to them
CREATE POLICY "Assignees can view their assigned tasks" 
ON public.trainer_task_assignments 
FOR SELECT 
USING (true);