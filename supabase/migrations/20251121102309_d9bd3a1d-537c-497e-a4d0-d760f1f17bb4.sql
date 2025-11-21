-- Create roriri_project_enquiry table for RORIRI Software Solution
CREATE TABLE IF NOT EXISTS public.roriri_project_enquiry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_code TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_name TEXT NOT NULL,
  company TEXT,
  enquiry_for TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roriri_project_enquiry ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company users
CREATE POLICY "IT Company users can view enquiries"
  ON public.roriri_project_enquiry
  FOR SELECT
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can insert enquiries"
  ON public.roriri_project_enquiry
  FOR INSERT
  WITH CHECK (
    has_entity_access(auth.uid(), (
      SELECT id FROM entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can update enquiries"
  ON public.roriri_project_enquiry
  FOR UPDATE
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can delete enquiries"
  ON public.roriri_project_enquiry
  FOR DELETE
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM entities WHERE code = 'it_company'
    ))
  );

-- Create index for better query performance
CREATE INDEX idx_roriri_project_enquiry_date ON public.roriri_project_enquiry(date DESC);
CREATE INDEX idx_roriri_project_enquiry_status ON public.roriri_project_enquiry(status);