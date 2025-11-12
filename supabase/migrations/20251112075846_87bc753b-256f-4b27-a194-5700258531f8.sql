-- Add policy to allow admins to view all employees
CREATE POLICY "Admins can view all employees"
ON public.employees
FOR SELECT
USING (is_admin(auth.uid()));

-- Add policy to allow admins to manage all employees
CREATE POLICY "Admins can manage all employees"
ON public.employees
FOR ALL
USING (is_admin(auth.uid()));