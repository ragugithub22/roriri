-- Populate user_login table with data from existing tables
-- Insert data from profiles table
INSERT INTO user_login (email, username, password, user_type, original_id)
SELECT
    email,
    username,
    password,
    'profile',
    id
FROM profiles
WHERE password IS NOT NULL AND email IS NOT NULL;

-- Insert data from students table
INSERT INTO user_login (email, username, password, user_type, original_id)
SELECT
    email,
    NULL as username, -- students table doesn't have username
    password,
    'student',
    id
FROM students
WHERE password IS NOT NULL AND email IS NOT NULL
ON CONFLICT (email) DO NOTHING; -- Skip if email already exists

-- Insert data from internship_candidates table
INSERT INTO user_login (email, username, password, user_type, original_id)
SELECT
    email,
    username,
    password,
    'internship_candidate',
    id
FROM internship_candidates
WHERE password IS NOT NULL AND email IS NOT NULL
ON CONFLICT (email) DO NOTHING; -- Skip if email already exists

-- Update the updated_at timestamp
UPDATE user_login SET updated_at = NOW();