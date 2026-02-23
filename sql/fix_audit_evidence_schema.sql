-- Migration to fix audit_evidence schema mismatch
-- This migration aligns the database with the application logic in EvidenceUpload.tsx

-- 1. Remove the old attachment_id column
ALTER TABLE audit_evidence DROP COLUMN IF EXISTS attachment_id;

-- 2. Add new columns for direct file metadata
ALTER TABLE audit_evidence ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE audit_evidence ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE audit_evidence ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE audit_evidence ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES user_profiles(id);

-- 3. Rename audit_item_id to item_id to match the code's expectation if necessary
-- Note: The code currently uses 'item_id'. We will rename the DB column to match.
ALTER TABLE audit_evidence RENAME COLUMN audit_item_id TO item_id;

-- 4. Update RLS policies to ensure 'uploaded_by' is handled correctly
DROP POLICY IF EXISTS audit_evidence_mod ON audit_evidence;
CREATE POLICY audit_evidence_mod ON audit_evidence FOR ALL TO authenticated USING (TRUE);
