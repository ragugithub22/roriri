-- Create internship_candidates table
CREATE TABLE IF NOT EXISTS public.internship_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  incharge_person_id UUID REFERENCES employees(id),
  course_id UUID REFERENCES courses(id),
  fees NUMERIC,
  duration_value INTEGER,
  duration_unit TEXT DEFAULT 'months',
  gender TEXT,
  mode TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  image_url TEXT,
  joining_date DATE,
  username TEXT,
  password TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.internship_candidates ENABLE ROW LEVEL SECURITY;

-- RLS policies for IT Company users
CREATE POLICY "IT Company users can view internship candidates"
  ON public.internship_candidates FOR SELECT
  USING (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );

CREATE POLICY "IT Company users can manage internship candidates"
  ON public.internship_candidates FOR ALL
  USING (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );

-- Create internship_payments table
CREATE TABLE IF NOT EXISTS public.internship_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES internship_candidates(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL,
  pending_amount NUMERIC NOT NULL,
  received_by TEXT,
  payment_mode TEXT,
  notes TEXT,
  receipt_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.internship_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for internship payments
CREATE POLICY "IT Company users can view internship payments"
  ON public.internship_payments FOR SELECT
  USING (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );

CREATE POLICY "IT Company users can manage internship payments"
  ON public.internship_payments FOR ALL
  USING (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );