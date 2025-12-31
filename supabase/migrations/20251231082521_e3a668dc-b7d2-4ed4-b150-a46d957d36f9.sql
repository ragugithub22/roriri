-- Allow interns to view their own record in internship_candidates
CREATE POLICY "Interns can view their own record" 
ON public.internship_candidates 
FOR SELECT 
USING (
  id::text = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'original_id'
);