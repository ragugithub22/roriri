-- Create meeting_details table
CREATE TABLE public.meeting_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  meeting_for TEXT NOT NULL,
  participants TEXT NOT NULL,
  hours NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meeting_details ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company users
CREATE POLICY "IT Company users can view meeting_details"
  ON public.meeting_details
  FOR SELECT
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM public.entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can manage meeting_details"
  ON public.meeting_details
  FOR ALL
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM public.entities WHERE code = 'it_company'
    ))
  );

-- Create trigger for updated_at
CREATE TRIGGER update_meeting_details_updated_at
  BEFORE UPDATE ON public.meeting_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();