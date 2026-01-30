-- Add RLS policy to allow all authenticated users to view internship candidates
-- This matches the pattern used for other tables in the system
CREATE POLICY "Authenticated users can view internship candidates" 
ON public.internship_candidates 
FOR SELECT 
USING (true);