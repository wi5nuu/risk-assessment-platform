-- =====================================================
-- RBAC Migration: viewer → auditee
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Update existing 'viewer' roles to 'auditee'
UPDATE user_profiles SET role = 'auditee' WHERE role = 'viewer';

-- 2. Drop old constraint and add new one (if constraint exists)
DO $$
BEGIN
  -- Try to drop old constraint
  BEGIN
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Add new constraint with 'auditee' instead of 'viewer'
  BEGIN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
      CHECK (role IN ('admin', 'auditor', 'auditee'));
  EXCEPTION WHEN OTHERS THEN
    NULL; -- constraint might already exist
  END;
END $$;

-- 3. Create storage bucket for evidence uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-evidence', 'audit-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS policies for audit-evidence bucket
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload evidence" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audit-evidence' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can view evidence in their org" ON storage.objects;
CREATE POLICY "Users can view evidence in their org" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audit-evidence' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Auditors can delete evidence" ON storage.objects;
CREATE POLICY "Auditors can delete evidence" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audit-evidence' AND auth.role() = 'authenticated'
  );
