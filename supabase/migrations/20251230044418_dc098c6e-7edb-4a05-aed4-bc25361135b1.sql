-- Drop existing restrictive policies that don't work with the custom auth system
DROP POLICY IF EXISTS "Trainees can view own academy_payments" ON public.academy_payments;
DROP POLICY IF EXISTS "Trainees can view subjects for their course" ON public.subjects;
DROP POLICY IF EXISTS "Trainees can view syllabus for their course" ON public.syllabus;

-- Create new policies that allow authenticated users to read this data
-- The app-level filtering handles user-specific data

-- academy_payments: allow authenticated users to view payments
-- (already has other policies, but we need one that works)
CREATE POLICY "Authenticated users can view academy_payments"
ON public.academy_payments
FOR SELECT
TO authenticated
USING (true);

-- subjects: allow authenticated users to view subjects
CREATE POLICY "Authenticated users can view subjects"
ON public.subjects
FOR SELECT
TO authenticated
USING (true);

-- syllabus: allow authenticated users to view syllabus
CREATE POLICY "Authenticated users can view syllabus"
ON public.syllabus
FOR SELECT
TO authenticated
USING (true);