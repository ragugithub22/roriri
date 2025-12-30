-- Secure helper function to fetch chat contacts (admins/managers/hr/trainers)
-- This avoids exposing public.user_roles to trainees while still populating chat contacts.

CREATE OR REPLACE FUNCTION public.get_chat_contacts()
RETURNS TABLE(
  employee_id uuid,
  profile_id uuid,
  full_name text,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id AS employee_id,
    e.profile_id AS profile_id,
    COALESCE(p.full_name, 'Unknown') AS full_name,
    ur.role::text AS role
  FROM public.employees e
  LEFT JOIN public.profiles p ON p.id = e.profile_id
  INNER JOIN public.user_roles ur ON ur.user_id = e.profile_id
  WHERE e.status = 'active'
    AND ur.role IN ('admin', 'manager', 'hr', 'trainer')
  ORDER BY COALESCE(p.full_name, 'Unknown') ASC;
$$;

REVOKE ALL ON FUNCTION public.get_chat_contacts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_chat_contacts() TO authenticated;