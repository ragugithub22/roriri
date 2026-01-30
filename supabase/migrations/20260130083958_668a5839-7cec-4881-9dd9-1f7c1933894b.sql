-- Add UPDATE policy for assignees to submit their task files
CREATE POLICY "Assignees can update file submission on their tasks"
ON public.trainer_task_assignments
FOR UPDATE
USING (assignee_id = public.get_user_original_id())
WITH CHECK (assignee_id = public.get_user_original_id());