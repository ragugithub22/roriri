-- Create coordinators table for Roriri Software Solution
CREATE TABLE public.coordinators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL,
  coordinator_name TEXT NOT NULL,
  description TEXT,
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT coordinators_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.coordinators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for IT Company users
CREATE POLICY "IT Company users can view coordinators"
  ON public.coordinators FOR SELECT
  USING (
    has_entity_access(auth.uid(), entity_id)
  );

CREATE POLICY "IT Company users can manage coordinators"
  ON public.coordinators FOR ALL
  USING (
    has_entity_access(auth.uid(), entity_id)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_coordinators_updated_at
  BEFORE UPDATE ON public.coordinators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();