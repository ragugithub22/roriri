-- Allow anonymous users to insert into industrial_visit_registrations
CREATE POLICY "Allow anonymous registration for industrial visits"
ON public.industrial_visit_registrations
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to view visitor records (for displaying college details)
CREATE POLICY "Allow anonymous to view visitor records"
ON public.industrial_visit_visitors
FOR SELECT
TO anon
USING (true);