-- Insert missing user "nathiya" into user_login table
INSERT INTO user_login (email, username, password, user_type, original_id)
VALUES ('nathiya@roririsoft.com', 'nathiya', 'nathiya', 'profile', '3cec4edc-1f29-4b80-894a-0d4f7c448a1c')
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  updated_at = NOW();