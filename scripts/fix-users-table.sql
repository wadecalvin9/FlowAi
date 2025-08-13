-- Make password_hash nullable since we're using Supabase auth
-- Supabase handles password hashing in their auth.users table
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Set default value for existing records if any
UPDATE users SET password_hash = NULL WHERE password_hash = '';

-- Add comment to clarify the field is not used with Supabase auth
COMMENT ON COLUMN users.password_hash IS 'Legacy field - not used with Supabase auth. Supabase handles password hashing in auth.users table.';
