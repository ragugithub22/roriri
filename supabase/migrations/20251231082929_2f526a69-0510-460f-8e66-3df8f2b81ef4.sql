-- Create a secure function to get the intern's original ID from profiles + user_login
CREATE OR REPLACE FUNCTION public.get_intern_original_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ul.original_id
  FROM public.profiles p
  INNER JOIN public.user_login ul ON ul.email = p.email
  WHERE p.id = _user_id
    AND ul.user_type = 'internship_candidate'
  LIMIT 1
$$;