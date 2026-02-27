-- Tighten RLS policies for the audit module to match RBAC requirements

-- Helper function to check if user is an auditor or admin (already exists in schema.sql as get_user_org_id, but let's make a role check)
CREATE OR REPLACE FUNCTION is_auditor_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'auditor')
  );
$$;

-- 1. Audit Checklists
DROP POLICY IF EXISTS audit_checklists_mod ON audit_checklists;
CREATE POLICY audit_checklists_insert ON audit_checklists FOR INSERT WITH CHECK (is_auditor_or_admin());
CREATE POLICY audit_checklists_update ON audit_checklists FOR UPDATE USING (is_auditor_or_admin());
CREATE POLICY audit_checklists_delete ON audit_checklists FOR DELETE USING (is_auditor_or_admin());

-- 2. Audit Items
DROP POLICY IF EXISTS audit_items_mod ON audit_items;
CREATE POLICY audit_items_insert ON audit_items FOR INSERT WITH CHECK (is_auditor_or_admin());
CREATE POLICY audit_items_update ON audit_items FOR UPDATE USING (is_auditor_or_admin());

-- 3. Audit Findings
DROP POLICY IF EXISTS audit_findings_mod ON audit_findings;
CREATE POLICY audit_findings_insert ON audit_findings FOR INSERT WITH CHECK (is_auditor_or_admin());
CREATE POLICY audit_findings_update ON audit_findings FOR UPDATE USING (is_auditor_or_admin());
CREATE POLICY audit_findings_delete ON audit_findings FOR DELETE USING (is_auditor_or_admin());

-- 4. Evidence (Uploaders/Auditors only)
DROP POLICY IF EXISTS audit_evidence_mod ON audit_evidence;
CREATE POLICY audit_evidence_insert ON audit_evidence FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY audit_evidence_delete ON audit_evidence FOR DELETE USING (is_auditor_or_admin());
