-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, entity_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_code TEXT NOT NULL UNIQUE,
  batch_name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.it_trainers(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  schedule TEXT,
  max_students INTEGER DEFAULT 30,
  status status_type DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_number TEXT NOT NULL UNIQUE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL,
  status status_type DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create academy_payments table
CREATE TABLE IF NOT EXISTS public.academy_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_code TEXT NOT NULL UNIQUE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  status payment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.academy_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can view all user_roles'
  ) THEN
    CREATE POLICY "Admins can view all user_roles"
      ON public.user_roles FOR SELECT
      USING (is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage user_roles'
  ) THEN
    CREATE POLICY "Admins can manage user_roles"
      ON public.user_roles FOR ALL
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- RLS Policies for batches
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'IT Academy users can view batches'
  ) THEN
    CREATE POLICY "IT Academy users can view batches"
      ON public.batches FOR SELECT
      USING (has_entity_access(auth.uid(), (SELECT id FROM entities WHERE code = 'it_academy')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'IT Academy users can manage batches'
  ) THEN
    CREATE POLICY "IT Academy users can manage batches"
      ON public.batches FOR ALL
      USING (has_entity_access(auth.uid(), (SELECT id FROM entities WHERE code = 'it_academy')));
  END IF;
END $$;

-- RLS Policies for certificates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'IT Academy users can view certificates'
  ) THEN
    CREATE POLICY "IT Academy users can view certificates"
      ON public.certificates FOR SELECT
      USING (has_entity_access(auth.uid(), (SELECT id FROM entities WHERE code = 'it_academy')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'IT Academy users can manage certificates'
  ) THEN
    CREATE POLICY "IT Academy users can manage certificates"
      ON public.certificates FOR ALL
      USING (has_entity_access(auth.uid(), (SELECT id FROM entities WHERE code = 'it_academy')));
  END IF;
END $$;

-- RLS Policies for academy_payments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'academy_payments' AND policyname = 'IT Academy users can view payments'
  ) THEN
    CREATE POLICY "IT Academy users can view payments"
      ON public.academy_payments FOR SELECT
      USING (has_entity_access(auth.uid(), (SELECT id FROM entities WHERE code = 'it_academy')));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'academy_payments' AND policyname = 'IT Academy users can manage payments'
  ) THEN
    CREATE POLICY "IT Academy users can manage payments"
      ON public.academy_payments FOR ALL
      USING (has_entity_access(auth.uid(), (SELECT id FROM entities WHERE code = 'it_academy')));
  END IF;
END $$;

-- Triggers for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_batches_updated_at'
  ) THEN
    CREATE TRIGGER update_batches_updated_at
      BEFORE UPDATE ON public.batches
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;