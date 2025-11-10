-- Grant admin role to the demo user so they can manage employees
INSERT INTO user_roles (user_id, role, entity_id)
SELECT '17816620-f095-40d1-86eb-a6871dc9832e'::uuid, 'admin'::app_role, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = '17816620-f095-40d1-86eb-a6871dc9832e' 
  AND role = 'admin'
);