-- Create roriri_project_details table
CREATE TABLE IF NOT EXISTS public.roriri_project_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  description text,
  assigned_to uuid REFERENCES public.employees(id),
  assigned_by uuid REFERENCES public.employees(id),
  duration_value integer NOT NULL,
  duration_unit text NOT NULL CHECK (duration_unit IN ('Month', 'Week')),
  status text NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'In Progress', 'Completed', 'On Hold')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roriri_project_details ENABLE ROW LEVEL SECURITY;

-- Create policies for IT Company users
CREATE POLICY "IT Company users can view project details"
  ON public.roriri_project_details
  FOR SELECT
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM entities WHERE code = 'it_company'
    ))
  );

CREATE POLICY "IT Company users can manage project details"
  ON public.roriri_project_details
  FOR ALL
  USING (
    has_entity_access(auth.uid(), (
      SELECT id FROM entities WHERE code = 'it_company'
    ))
  );

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.roriri_project_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();