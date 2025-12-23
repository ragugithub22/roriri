-- Allow trainees (students) to read their own academy payments and related curriculum (subjects + syllabus)

-- 1) academy_payments: trainees can view only their own payment rows
CREATE POLICY "Trainees can view own academy_payments"
ON public.academy_payments
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- 2) subjects: trainees can view subjects for their paid/assigned course(s)
CREATE POLICY "Trainees can view subjects for their course"
ON public.subjects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.academy_payments p
    WHERE p.student_id = auth.uid()
      AND p.course_id = subjects.course_id
  )
);

-- 3) syllabus: trainees can view syllabus for subjects in their course(s)
CREATE POLICY "Trainees can view syllabus for their course"
ON public.syllabus
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.subjects s
    JOIN public.academy_payments p
      ON p.course_id = s.course_id
    WHERE p.student_id = auth.uid()
      AND s.id = syllabus.subject_id
  )
);