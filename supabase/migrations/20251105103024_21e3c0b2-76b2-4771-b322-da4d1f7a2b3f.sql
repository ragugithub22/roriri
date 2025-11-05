-- Create enum for work status
CREATE TYPE work_status AS ENUM ('completed', 'in_progress', 'pending');

-- Create daily_work_updates table
CREATE TABLE public.daily_work_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_description TEXT NOT NULL,
  hours_spent NUMERIC(4,2) NOT NULL,
  status work_status NOT NULL DEFAULT 'in_progress',
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_work_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own updates
CREATE POLICY "Users can insert their own work updates"
ON public.daily_work_updates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own updates
CREATE POLICY "Users can view their own work updates"
ON public.daily_work_updates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins and managers can view all updates
CREATE POLICY "Admins and managers can view all work updates"
ON public.daily_work_updates
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Policy: Admins and managers can update (for review)
CREATE POLICY "Admins and managers can update work updates"
ON public.daily_work_updates
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_daily_work_updates_updated_at
BEFORE UPDATE ON public.daily_work_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_daily_work_updates_user_id ON public.daily_work_updates(user_id);
CREATE INDEX idx_daily_work_updates_date ON public.daily_work_updates(date);
CREATE INDEX idx_daily_work_updates_employee_id ON public.daily_work_updates(employee_id);