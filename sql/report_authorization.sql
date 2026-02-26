-- ============================================================
-- REPORT DOWNLOAD AUTHORIZATION TABLES
-- Paste this into your Supabase SQL Editor
-- ============================================================

-- Table 1: Authorized team members who can download the report
CREATE TABLE IF NOT EXISTS report_authorized_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with your team
INSERT INTO report_authorized_users (full_name, student_id, email) VALUES
('Wisnu Alfian Nur Ashar', '001202400138', 'wisnu.ashar@student.president.ac.id'),
('Muhammad Ilham Maulana', '001202400034', 'ilham@student.president.ac.id'),
('Christofer Sofian Rialdi Sitompul', '001202400079', 'christofer@student.president.ac.id'),
('Muhammad Ahda Briliantama', '001202400081', 'ahda@student.president.ac.id'),
('Rafa Basia Hanif', '001202400043', 'rafa@student.president.ac.id');

-- Enable RLS (only service_role can access)
ALTER TABLE report_authorized_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON report_authorized_users FOR ALL USING (auth.role() = 'service_role');

-- Table 2: Download logs
CREATE TABLE IF NOT EXISTS report_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  authorized_user_id UUID REFERENCES report_authorized_users(id),
  downloaded_by_auth_id UUID,
  full_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  email TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

ALTER TABLE report_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON report_downloads FOR ALL USING (auth.role() = 'service_role');
