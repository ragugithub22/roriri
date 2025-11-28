-- Assign admin role to the super admin user
INSERT INTO public.user_roles (user_id, role)
SELECT 'f671301f-e93d-4b97-a733-717eefe9e780'::uuid, 'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'f671301f-e93d-4b97-a733-717eefe9e780' 
  AND role = 'admin'
);