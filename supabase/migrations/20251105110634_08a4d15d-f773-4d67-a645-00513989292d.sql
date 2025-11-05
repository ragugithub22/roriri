-- Grant IT Academy access to the demo user
INSERT INTO user_roles (user_id, entity_id, role)
SELECT 
  '17816620-f095-40d1-86eb-a6871dc9832e'::uuid,
  id,
  'manager'::app_role
FROM entities 
WHERE code = 'it_academy'
ON CONFLICT DO NOTHING;