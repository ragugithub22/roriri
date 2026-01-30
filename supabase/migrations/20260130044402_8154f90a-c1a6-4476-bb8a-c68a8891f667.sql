-- Allow authenticated users to update industrial visit registrations (e.g., payment)
CREATE POLICY "Authenticated users can update registrations"
ON public.industrial_visit_registrations
FOR UPDATE
TO public
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');