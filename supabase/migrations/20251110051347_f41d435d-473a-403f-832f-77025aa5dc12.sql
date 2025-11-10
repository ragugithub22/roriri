-- Create roles master table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
CREATE POLICY "Anyone can view roles"
  ON public.roles
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.roles
  FOR ALL
  USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing roles from enum
INSERT INTO public.roles (role_name, description) VALUES
  ('admin', 'Administrator with full system access'),
  ('manager', 'Manager with entity-level access'),
  ('staff', 'Staff member with limited access'),
  ('viewer', 'View-only access'),
  ('trainer', 'Trainer for IT Academy'),
  ('trainee', 'Student in IT Academy'),
  ('hr', 'Human Resources staff');