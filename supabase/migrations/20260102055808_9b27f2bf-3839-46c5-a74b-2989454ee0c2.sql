-- Drop the problematic SELECT policy and create a more permissive one for viewing students
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;

-- Create a policy that allows all authenticated users to view students
CREATE POLICY "Anyone authenticated can view students" 
ON public.students 
FOR SELECT 
TO authenticated
USING (true);