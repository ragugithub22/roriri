-- Add admin policy for user_roles table
CREATE POLICY "Admins can manage all user_roles"
ON public.user_roles
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));