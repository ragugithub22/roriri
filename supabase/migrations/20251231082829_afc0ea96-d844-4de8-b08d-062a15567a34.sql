-- First drop the existing insecure policy that references user_metadata
DROP POLICY IF EXISTS "Interns can view their own record" ON public.internship_candidates;