-- Add working_days and bonus columns to payroll table
ALTER TABLE public.payroll 
ADD COLUMN IF NOT EXISTS working_days INTEGER,
ADD COLUMN IF NOT EXISTS bonus DECIMAL(15,2) DEFAULT 0;

-- Enable RLS on payroll table if not already enabled
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payroll
CREATE POLICY "Admins can manage all payroll records" 
ON public.payroll 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Entity users can view payroll records" 
ON public.payroll 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = payroll.employee_id 
    AND has_entity_access(auth.uid(), employees.entity_id)
  )
);

CREATE POLICY "Entity users can manage payroll records" 
ON public.payroll 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = payroll.employee_id 
    AND has_entity_access(auth.uid(), employees.entity_id)
  )
);