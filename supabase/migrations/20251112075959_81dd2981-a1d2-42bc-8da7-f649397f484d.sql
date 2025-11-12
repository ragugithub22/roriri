-- Assign admin role to the current user (check if not exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = 'f671301f-e93d-4b97-a733-717eefe9e780' 
    AND role = 'admin'
  ) THEN
    INSERT INTO user_roles (user_id, role) 
    VALUES ('f671301f-e93d-4b97-a733-717eefe9e780', 'admin');
  END IF;
END $$;