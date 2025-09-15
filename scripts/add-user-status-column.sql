-- Add is_active column to profiles table for user management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Update existing users to be active by default
UPDATE profiles SET is_active = true WHERE is_active IS NULL;
