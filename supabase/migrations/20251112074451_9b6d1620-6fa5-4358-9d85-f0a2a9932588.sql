-- Add policy to allow admins and managers to update all profiles
CREATE POLICY "Admins and managers can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Add policy to allow admins and managers to insert profiles
CREATE POLICY "Admins and managers can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);