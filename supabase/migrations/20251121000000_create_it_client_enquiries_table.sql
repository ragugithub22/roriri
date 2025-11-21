-- Create IT Client Enquiries table
CREATE TABLE IF NOT EXISTS public.it_client_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_code TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  client_name TEXT NOT NULL,
  company TEXT,
  enquiry_for TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.it_client_enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company entity access
CREATE POLICY "Entity users can access it_client_enquiries"
  ON public.it_client_enquiries FOR ALL
  USING (public.has_entity_access(auth.uid(), (SELECT id FROM public.entities WHERE code = 'it_company')));

-- Create trigger for updated_at
CREATE TRIGGER update_it_client_enquiries_updated_at
  BEFORE UPDATE ON public.it_client_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_it_client_enquiries_enquiry_code ON public.it_client_enquiries(enquiry_code);
CREATE INDEX idx_it_client_enquiries_status ON public.it_client_enquiries(status);
CREATE INDEX idx_it_client_enquiries_date ON public.it_client_enquiries(date);
