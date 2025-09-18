-- Combined Database Fix Script for User Management
-- This script fixes all issues with the profiles table and admin panel

-- 1. Ensure profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 3. Update existing users to have default values
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- 4. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_status_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- 5. Create a secure admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Return false if not authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the current user's role from their profile
  -- Use a direct query with security definer to bypass RLS
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user') = 'admin';
END;
$$;

-- 6. Create a service role check function (for API routes)
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current role is service_role
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
END;
$$;

-- 7. Create new RLS policies
-- Allow users to read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles 
FOR SELECT USING (public.is_admin() = true);

-- Allow service role to read all profiles (for API routes)
CREATE POLICY "profiles_select_service" ON public.profiles 
FOR SELECT USING (public.is_service_role() = true);

-- Allow users to update their own profile (limited fields)
CREATE POLICY "profiles_update_own" ON public.profiles 
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Allow admins to update all profiles
CREATE POLICY "profiles_update_admin" ON public.profiles 
FOR UPDATE USING (public.is_admin() = true);

-- Allow service role to update all profiles
CREATE POLICY "profiles_update_service" ON public.profiles 
FOR UPDATE USING (public.is_service_role() = true);

-- Allow new users to insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Update the user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_sign_in_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 9. Ensure the trigger is properly set
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO anon;
GRANT EXECUTE ON FUNCTION public.is_service_role() TO service_role;

-- 11. Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create index for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 13. Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 14. Activity logs policies
CREATE POLICY "activity_logs_insert_authenticated" ON public.activity_logs 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "activity_logs_select_admin" ON public.activity_logs 
FOR SELECT USING (public.is_admin() = true);

CREATE POLICY "activity_logs_select_service" ON public.activity_logs 
FOR SELECT USING (public.is_service_role() = true);

-- 15. Update last_sign_in_at on auth events
CREATE OR REPLACE FUNCTION public.update_last_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger for updating last sign in
DROP TRIGGER IF EXISTS on_auth_login ON auth.sessions;
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_last_sign_in();

-- 16. Insert a test admin user (optional - comment out if not needed)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-admin-email@example.com';

-- 17. Verify the setup
SELECT 
  'Profiles table columns' as check_item,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('id', 'email', 'full_name', 'role', 'created_at', 'last_sign_in_at', 'is_active');

SELECT 
  'RLS policies count' as check_item,
  COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'profiles';

-- End of script
