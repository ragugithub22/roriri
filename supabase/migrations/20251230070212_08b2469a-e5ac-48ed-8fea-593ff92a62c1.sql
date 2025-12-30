-- Allow all authenticated users to view employees (for complaint recipient selection)
CREATE POLICY "Authenticated users can view employees"
ON public.employees
FOR SELECT
USING (auth.uid() IS NOT NULL);