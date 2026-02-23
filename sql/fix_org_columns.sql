-- Add missing columns to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website VARCHAR(255);
