-- Add INSERT policy for authenticated users to add users to user_login
CREATE POLICY "Authenticated users can insert user_login"
ON public.user_login
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add UPDATE policy for authenticated users
CREATE POLICY "Authenticated users can update user_login"
ON public.user_login
FOR UPDATE
TO authenticated
USING (true);

-- Add DELETE policy for authenticated users
CREATE POLICY "Authenticated users can delete user_login"
ON public.user_login
FOR DELETE
TO authenticated
USING (true);

-- Add SELECT policy for all authenticated users to see all records
CREATE POLICY "Authenticated users can view all user_login"
ON public.user_login
FOR SELECT
TO authenticated
USING (true);