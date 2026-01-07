-- Add a policy to allow public read access to employees table
-- This is needed because custom login users don't have a Supabase auth.uid()
CREATE POLICY "Allow public read access to employees"
ON public.employees
FOR SELECT
USING (true);

-- Also need to allow public read access to profiles for employee list display
CREATE POLICY "Allow public read access to profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the existing restrictive SELECT policies that require auth.uid()
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;