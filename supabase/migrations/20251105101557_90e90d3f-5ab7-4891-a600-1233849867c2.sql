-- Create priority enum
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

-- Create task status enum  
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create user_tasks table for general task assignment
CREATE TABLE public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and managers can view all tasks
CREATE POLICY "Admins and managers can view all user_tasks"
ON public.user_tasks
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Policy: Users can view tasks assigned to them
CREATE POLICY "Users can view their assigned user_tasks"
ON public.user_tasks
FOR SELECT
TO authenticated
USING (assigned_to = auth.uid());

-- Policy: Admins and managers can create tasks
CREATE POLICY "Admins and managers can create user_tasks"
ON public.user_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Policy: Admins and managers can update all tasks
CREATE POLICY "Admins and managers can update all user_tasks"
ON public.user_tasks
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Policy: Users can update status of their assigned tasks
CREATE POLICY "Users can update their user_task status"
ON public.user_tasks
FOR UPDATE
TO authenticated
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- Policy: Admins and managers can delete tasks
CREATE POLICY "Admins and managers can delete user_tasks"
ON public.user_tasks
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Add updated_at trigger
CREATE TRIGGER update_user_tasks_updated_at
BEFORE UPDATE ON public.user_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.user_tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_tasks;