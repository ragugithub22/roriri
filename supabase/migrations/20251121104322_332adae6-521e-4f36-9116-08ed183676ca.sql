-- Create roriri_all_enquiries table
CREATE TABLE IF NOT EXISTS public.roriri_all_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roriri_all_enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for IT Company users
CREATE POLICY "IT Company users can view all enquiries"
  ON public.roriri_all_enquiries
  FOR SELECT
  USING (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );

CREATE POLICY "IT Company users can insert all enquiries"
  ON public.roriri_all_enquiries
  FOR INSERT
  WITH CHECK (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );

CREATE POLICY "IT Company users can update all enquiries"
  ON public.roriri_all_enquiries
  FOR UPDATE
  USING (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );

CREATE POLICY "IT Company users can delete all enquiries"
  ON public.roriri_all_enquiries
  FOR DELETE
  USING (
    has_entity_access(
      auth.uid(),
      (SELECT id FROM entities WHERE code = 'it_company')
    )
  );