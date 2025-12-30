-- Create a secure helper function to fetch complaint recipients (admins/managers/hr/trainers)
-- This avoids exposing the full user_roles table to trainees while still populating dropdowns.

CREATE OR REPLACE FUNCTION public.get_complaint_recipients()
RETURNS TABLE(employee_id uuid, full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id AS employee_id,
    COALESCE(p.full_name, 'Unknown') AS full_name
  FROM public.employees e
  LEFT JOIN public.profiles p ON p.id = e.profile_id
  INNER JOIN public.user_roles ur ON ur.user_id = e.profile_id
  WHERE e.status = 'active'
    AND ur.role IN ('admin', 'manager', 'hr', 'trainer')
  ORDER BY COALESCE(p.full_name, 'Unknown') ASC;
$$;

-- Lock down function execution
REVOKE ALL ON FUNCTION public.get_complaint_recipients() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_complaint_recipients() TO authenticated;