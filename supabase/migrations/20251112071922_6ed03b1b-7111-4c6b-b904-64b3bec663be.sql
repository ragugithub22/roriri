-- Add residence_type column to employees table
ALTER TABLE public.employees 
ADD COLUMN residence_type text CHECK (residence_type IN ('hostel', 'daily'));

-- Add comment for documentation
COMMENT ON COLUMN public.employees.residence_type IS 'Indicates whether employee stays in hostel or comes daily';
