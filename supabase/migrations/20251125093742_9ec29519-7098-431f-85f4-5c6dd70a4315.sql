-- Create industrial_visit_visitors table
CREATE TABLE IF NOT EXISTS public.industrial_visit_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name TEXT NOT NULL,
  date DATE NOT NULL,
  department TEXT NOT NULL,
  students_count INTEGER NOT NULL DEFAULT 0,
  staff_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industrial_visit_visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company users
CREATE POLICY "IT Company users can view all industrial visit visitors"
  ON public.industrial_visit_visitors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.entities ent ON e.entity_id = ent.id
      WHERE e.profile_id = auth.uid()
      AND ent.code = 'it_company'
    )
  );

CREATE POLICY "IT Company users can insert industrial visit visitors"
  ON public.industrial_visit_visitors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.entities ent ON e.entity_id = ent.id
      WHERE e.profile_id = auth.uid()
      AND ent.code = 'it_company'
    )
  );

CREATE POLICY "IT Company users can update industrial visit visitors"
  ON public.industrial_visit_visitors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.entities ent ON e.entity_id = ent.id
      WHERE e.profile_id = auth.uid()
      AND ent.code = 'it_company'
    )
  );

CREATE POLICY "IT Company users can delete industrial visit visitors"
  ON public.industrial_visit_visitors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.entities ent ON e.entity_id = ent.id
      WHERE e.profile_id = auth.uid()
      AND ent.code = 'it_company'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_industrial_visit_visitors_updated_at
  BEFORE UPDATE ON public.industrial_visit_visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();