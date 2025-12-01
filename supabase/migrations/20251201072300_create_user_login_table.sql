-- Create user_login table to centralize login credentials
CREATE TABLE IF NOT EXISTS user_login (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- 'profile', 'student', 'internship_candidate'
    original_id UUID NOT NULL, -- Reference to the original table's ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_login_email ON user_login(email);
CREATE INDEX IF NOT EXISTS idx_user_login_username ON user_login(username);
CREATE INDEX IF NOT EXISTS idx_user_login_user_type ON user_login(user_type);

-- Enable RLS
ALTER TABLE user_login ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (admin access)
CREATE POLICY "Service role can manage user_login" ON user_login
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read their own login data" ON user_login
    FOR SELECT USING (
        auth.uid()::text = original_id::text OR
        email = (SELECT email FROM profiles WHERE id = auth.uid())
    );