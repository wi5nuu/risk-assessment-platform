-- Add risk_id to audit_items to support automated asset linkage in findings
ALTER TABLE audit_items ADD COLUMN IF NOT EXISTS triggered_by_risk_id UUID REFERENCES risks(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_audit_items_risk ON audit_items(triggered_by_risk_id);
