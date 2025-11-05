-- Create subjects table if not exists
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_code TEXT NOT NULL UNIQUE,
  subject_name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  description TEXT,
  hours INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create syllabus table if not exists
CREATE TABLE IF NOT EXISTS public.syllabus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  learning_objectives TEXT,
  resources TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create students table if not exists
CREATE TABLE IF NOT EXISTS public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "IT Academy users can view subjects" ON public.subjects;
  DROP POLICY IF EXISTS "IT Academy users can manage subjects" ON public.subjects;
  DROP POLICY IF EXISTS "IT Academy users can view syllabus" ON public.syllabus;
  DROP POLICY IF EXISTS "IT Academy users can manage syllabus" ON public.syllabus;
  DROP POLICY IF EXISTS "IT Academy users can view students" ON public.students;
  DROP POLICY IF EXISTS "IT Academy users can manage students" ON public.students;
END $$;

-- RLS policies for subjects
CREATE POLICY "IT Academy users can view subjects"
ON public.subjects
FOR SELECT
TO authenticated
USING (
  has_entity_access(auth.uid(), ( SELECT entities.id
   FROM entities
  WHERE entities.code = 'it_academy'::entity_code))
);

CREATE POLICY "IT Academy users can manage subjects"
ON public.subjects
FOR ALL
TO authenticated
USING (
  has_entity_access(auth.uid(), ( SELECT entities.id
   FROM entities
  WHERE entities.code = 'it_academy'::entity_code))
);

-- RLS policies for syllabus
CREATE POLICY "IT Academy users can view syllabus"
ON public.syllabus
FOR SELECT
TO authenticated
USING (
  has_entity_access(auth.uid(), ( SELECT entities.id
   FROM entities
  WHERE entities.code = 'it_academy'::entity_code))
);

CREATE POLICY "IT Academy users can manage syllabus"
ON public.syllabus
FOR ALL
TO authenticated
USING (
  has_entity_access(auth.uid(), ( SELECT entities.id
   FROM entities
  WHERE entities.code = 'it_academy'::entity_code))
);

-- RLS policies for students
CREATE POLICY "IT Academy users can view students"
ON public.students
FOR SELECT
TO authenticated
USING (
  has_entity_access(auth.uid(), ( SELECT entities.id
   FROM entities
  WHERE entities.code = 'it_academy'::entity_code))
);

CREATE POLICY "IT Academy users can manage students"
ON public.students
FOR ALL
TO authenticated
USING (
  has_entity_access(auth.uid(), ( SELECT entities.id
   FROM entities
  WHERE entities.code = 'it_academy'::entity_code))
);

-- Add triggers for updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subjects_updated_at') THEN
    CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_syllabus_updated_at') THEN
    CREATE TRIGGER update_syllabus_updated_at
    BEFORE UPDATE ON public.syllabus
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
    CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_course_id ON public.subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_status ON public.subjects(status);
CREATE INDEX IF NOT EXISTS idx_syllabus_subject_id ON public.syllabus(subject_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_week_number ON public.syllabus(week_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON public.students(student_code);