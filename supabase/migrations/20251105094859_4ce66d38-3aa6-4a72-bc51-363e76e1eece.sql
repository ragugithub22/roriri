-- Drop duplicate/conflicting policies on user_roles
DROP POLICY IF EXISTS "Admins can manage all user_roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user_roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create clear, non-conflicting policies for user_roles
-- Allow admins and managers to view all user roles
CREATE POLICY "Admins and managers can view user_roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'hr')
);

-- Allow admins and HR to manage user roles
CREATE POLICY "Admins and HR can manage user_roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'hr')
)
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'hr')
);