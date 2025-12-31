-- Create the secure policy using the get_intern_original_id function
CREATE POLICY "Interns can view their own record" 
ON public.internship_candidates 
FOR SELECT 
USING (
  id = public.get_intern_original_id(auth.uid())
);