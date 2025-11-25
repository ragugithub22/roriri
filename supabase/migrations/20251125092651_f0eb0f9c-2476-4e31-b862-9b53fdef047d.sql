-- Create industrial_visit_enquiries table
CREATE TABLE public.industrial_visit_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.industrial_visit_enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company users
CREATE POLICY "IT Company users can view industrial visit enquiries"
  ON public.industrial_visit_enquiries
  FOR SELECT
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM public.entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can insert industrial visit enquiries"
  ON public.industrial_visit_enquiries
  FOR INSERT
  WITH CHECK (
    has_entity_access(auth.uid(), (
      SELECT id FROM public.entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can update industrial visit enquiries"
  ON public.industrial_visit_enquiries
  FOR UPDATE
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM public.entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can delete industrial visit enquiries"
  ON public.industrial_visit_enquiries
  FOR DELETE
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM public.entities WHERE code = 'it_company'
    ))
  );

-- Create trigger for updated_at
CREATE TRIGGER update_industrial_visit_enquiries_updated_at
  BEFORE UPDATE ON public.industrial_visit_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();