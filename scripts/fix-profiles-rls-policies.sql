-- Fix infinite recursion in profiles RLS policies
-- The issue is that admin policies are querying the profiles table to check admin status,
-- which creates a circular dependency when RLS is enabled.

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Create a function to check admin status using auth.jwt() claims
-- This avoids querying the profiles table directly in the policy
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role from their profile
  -- Use a direct query with security definer to bypass RLS
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user') = 'admin';
END;
$$;

-- Alternative approach: Create admin policies using service role bypass
-- Allow admins to read all profiles using the function
CREATE POLICY "profiles_select_admin" ON public.profiles 
FOR SELECT USING (public.is_admin());

-- Allow admins to update all profiles using the function
CREATE POLICY "profiles_update_admin" ON public.profiles 
FOR UPDATE USING (public.is_admin());

-- Add is_active column if it doesn't exist (needed for user management)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Allow admins to update user status
CREATE POLICY "profiles_update_status_admin" ON public.profiles 
FOR UPDATE USING (public.is_admin());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
