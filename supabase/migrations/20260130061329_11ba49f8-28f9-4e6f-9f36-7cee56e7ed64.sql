-- Create table for trainer task assignments
CREATE TABLE public.trainer_task_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assignee_type TEXT NOT NULL CHECK (assignee_type IN ('trainee', 'intern')),
    assignee_id UUID NOT NULL,
    task_description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainer_task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Trainers can view their own task assignments"
ON public.trainer_task_assignments
FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create task assignments"
ON public.trainer_task_assignments
FOR INSERT
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their own task assignments"
ON public.trainer_task_assignments
FOR UPDATE
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can delete their own task assignments"
ON public.trainer_task_assignments
FOR DELETE
USING (auth.uid() = trainer_id);

-- Trigger for updated_at
CREATE TRIGGER update_trainer_task_assignments_updated_at
BEFORE UPDATE ON public.trainer_task_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();