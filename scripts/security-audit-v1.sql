-- Security Audit and RLS Enhancement Script
-- Addresses identified gaps in row-level security and admin policies

-- 1. Add missing admin policies for agendas table
-- Adding admin-only write policies for agendas
CREATE POLICY "agendas_insert_admin" ON public.agendas 
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "agendas_update_admin" ON public.agendas 
FOR UPDATE USING (public.is_admin());

CREATE POLICY "agendas_delete_admin" ON public.agendas 
FOR DELETE USING (public.is_admin());

-- 2. Add role validation constraint
-- Enforcing valid role values at database level
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS chk_profile_role 
CHECK (role IN ('admin', 'user', 'moderator'));

-- 3. Add status column for user management if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'suspended', 'inactive'));

-- 4. Create comprehensive audit function
-- Adding audit trail for all admin operations
CREATE OR REPLACE FUNCTION public.audit_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the user is an admin performing the action
  IF public.is_admin() THEN
    INSERT INTO public.activity_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      created_at
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'old_data', to_jsonb(OLD),
        'new_data', to_jsonb(NEW),
        'timestamp', NOW()
      ),
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add audit triggers for admin operations
-- Adding audit triggers for all admin-modifiable tables
DROP TRIGGER IF EXISTS audit_agendas_changes ON public.agendas;
CREATE TRIGGER audit_agendas_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.agendas
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_action();

-- 6. Add missing DELETE policy for activity logs
-- Adding admin-only delete policy for activity logs
CREATE POLICY "activity_logs_delete_admin" ON public.activity_logs
FOR DELETE USING (public.is_admin());

-- 7. Create function to check moderator permissions
-- Adding moderator role support for granular permissions
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user') IN ('admin', 'moderator');
END;
$$;

-- 8. Add moderator policies for content management
-- Adding moderator permissions for content moderation
CREATE POLICY "suggestions_moderate" ON public.suggestions 
FOR UPDATE USING (public.is_moderator());

CREATE POLICY "suggestions_delete_moderate" ON public.suggestions 
FOR DELETE USING (public.is_moderator());

-- 9. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_moderator() TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_admin_action() TO authenticated;

-- 10. Add indexes for security-related queries
-- Adding performance indexes for security queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE role IN ('admin', 'moderator');
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);
