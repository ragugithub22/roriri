-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'trainer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'trainee';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'hr';