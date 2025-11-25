-- Create internship_enquiries table
CREATE TABLE IF NOT EXISTS public.internship_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  college_name TEXT,
  passout_year TEXT,
  department TEXT,
  description TEXT,
  address TEXT,
  comments TEXT,
  follow_up_date DATE,
  follow_status TEXT,
  enquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mode_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internship_enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company users
CREATE POLICY "IT Company users can view internship enquiries"
ON public.internship_enquiries
FOR SELECT
USING (
  has_entity_access(auth.uid(), (
    SELECT id FROM entities WHERE code = 'it_company'
  ))
);

CREATE POLICY "IT Company users can manage internship enquiries"
ON public.internship_enquiries
FOR ALL
USING (
  has_entity_access(auth.uid(), (
    SELECT id FROM entities WHERE code = 'it_company'
  ))
);