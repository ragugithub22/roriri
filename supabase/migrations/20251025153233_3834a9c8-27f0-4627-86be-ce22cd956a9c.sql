-- Create enum for functional roles/skills
CREATE TYPE public.employee_function AS ENUM (
  'administrator',
  'trainer',
  'developer',
  'supervisor',
  'director',
  'labor',
  'system_admin',
  'devops_engineer',
  'accountant',
  'hr_specialist',
  'business_development',
  'finance_specialist',
  'marketing_specialist',
  'project_manager',
  'consultant',
  'analyst',
  'coordinator',
  'specialist',
  'engineer',
  'technician'
);

-- Create junction table for employee functional roles
CREATE TABLE public.employee_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  function employee_function NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  assigned_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, function)
);

-- Enable RLS
ALTER TABLE public.employee_functions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Entity access control through employees table
CREATE POLICY "Entity access for employee_functions"
ON public.employee_functions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.id = employee_functions.employee_id
    AND has_entity_access(auth.uid(), employees.entity_id)
  )
);

-- Create index for performance
CREATE INDEX idx_employee_functions_employee_id ON public.employee_functions(employee_id);
CREATE INDEX idx_employee_functions_function ON public.employee_functions(function);

-- Add trigger for updated_at
CREATE TRIGGER update_employee_functions_updated_at
BEFORE UPDATE ON public.employee_functions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();