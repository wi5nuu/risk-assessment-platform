-- Migration to enhance audit_evidence table and storage
-- Allows evidence to be linked to a checklist globally, not just individual items.
-- Also makes item_id nullable to support global uploads.

-- 1. Ensure the storage bucket exists
-- This creates the bucket if it doesn't already exist.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-evidence', 'audit-evidence', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Add storage RLS policies (Allow all authenticated users for now, refine later if needed)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'audit-evidence');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audit-evidence');
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'audit-evidence');

-- 3. Add checklist_id column if it doesn't exist
ALTER TABLE audit_evidence ADD COLUMN IF NOT EXISTS checklist_id UUID REFERENCES audit_checklists(id) ON DELETE CASCADE;

-- 4. Make item_id nullable if it was previously NOT NULL
ALTER TABLE audit_evidence ALTER COLUMN item_id DROP NOT NULL;

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS idx_audit_evidence_checklist_id ON audit_evidence(checklist_id);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_item_id ON audit_evidence(item_id);

-- 6. Update RLS for audit_evidence table
ALTER TABLE audit_evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_evidence_all_policy ON audit_evidence;
CREATE POLICY audit_evidence_all_policy ON audit_evidence FOR ALL TO authenticated USING (TRUE);
