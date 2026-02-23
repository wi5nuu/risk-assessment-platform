-- Add exposure_level column to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS exposure_level VARCHAR(20) DEFAULT 'Low' CHECK (exposure_level IN ('Low', 'Medium', 'High', 'Critical'));
