-- =====================================================
-- VULNERABILITIES (OWASP TOP 10)
-- =====================================================

CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    suggested_impact INTEGER CHECK (suggested_impact BETWEEN 1 AND 5),
    suggested_likelihood INTEGER CHECK (suggested_likelihood BETWEEN 1 AND 5),
    audit_checklist_item TEXT, -- The checklist item it triggers (Requirement 4.5)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Mapping risks to one or more vulnerabilities
CREATE TABLE risk_vulnerability_mapping (
    risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
    vulnerability_id UUID REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (risk_id, vulnerability_id)
);

-- =====================================================
-- SECURITY AUDIT MODULE
-- =====================================================

CREATE TABLE audit_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    framework VARCHAR(100) NOT NULL, -- e.g., 'ISO 27001', 'NIST CSF', 'OCTAVE Allegro'
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed'
    compliance_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES audit_checklists(id) ON DELETE CASCADE,
    category VARCHAR(100), -- e.g., 'Access Control', 'Logging'
    control_title VARCHAR(255) NOT NULL,
    control_description TEXT,
    compliance_status VARCHAR(50) DEFAULT 'not_applicable' CHECK (compliance_status IN ('compliant', 'partially_compliant', 'non_compliant', 'not_applicable')),
    auditor_comments TEXT,
    source VARCHAR(50) DEFAULT 'framework', -- 'framework' or 'vulnerability_triggered'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link evidence to specific audit items
CREATE TABLE audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_item_id UUID NOT NULL REFERENCES audit_items(id) ON DELETE CASCADE,
    attachment_id UUID NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT FINDINGS
-- =====================================================

CREATE TABLE audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    audit_item_id UUID NOT NULL REFERENCES audit_items(id) ON DELETE CASCADE,
    issue TEXT NOT NULL,
    risk_description TEXT NOT NULL,
    affected_asset_id UUID REFERENCES assets(id),
    recommendation TEXT,
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_vulnerability_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY vulnerabilities_select ON vulnerabilities FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY risk_vulnerability_mapping_select ON risk_vulnerability_mapping FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY audit_checklists_select ON audit_checklists FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY audit_items_select ON audit_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY audit_evidence_select ON audit_evidence FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY audit_findings_select ON audit_findings FOR SELECT TO authenticated USING (TRUE);

-- Insert/Update policies (simplified for now)
CREATE POLICY audit_checklists_mod ON audit_checklists FOR ALL TO authenticated USING (TRUE);
CREATE POLICY audit_items_mod ON audit_items FOR ALL TO authenticated USING (TRUE);
CREATE POLICY audit_evidence_mod ON audit_evidence FOR ALL TO authenticated USING (TRUE);
CREATE POLICY audit_findings_mod ON audit_findings FOR ALL TO authenticated USING (TRUE);
CREATE POLICY risk_vulnerability_mapping_mod ON risk_vulnerability_mapping FOR ALL TO authenticated USING (TRUE);

-- =====================================================
-- SEED DATA: VULNERABILITIES (OWASP TOP 10)
-- =====================================================

INSERT INTO vulnerabilities (category, name, description, suggested_impact, suggested_likelihood, audit_checklist_item) VALUES
('Injection', 'SQL Injection', 'Unauthorized database access via input manipulation', 5, 3, 'Verify input validation and parameterized queries in database access layers.'),
('Injection', 'Command Injection', 'Executing system commands through application input', 5, 2, 'Verify strict input sanitization for system calls and use of safe APIs.'),
('Injection', 'LDAP Injection', 'Manipulating LDAP queries to bypass authentication', 4, 2, 'Verify LDAP query filters are properly escaped and validated.'),
('Broken Authentication', 'Weak Password Policy', 'Passwords that are easy to guess or brute-force', 3, 4, 'Verify password policy enforces minimum 8 characters, complexity, and rotation.'),
('Broken Authentication', 'No Account Lockout', 'Failure to block accounts after multiple failed logins', 3, 4, 'Verify account lockout mechanism triggers after 5 failed login attempts.'),
('Broken Authentication', 'Session Hijacking', 'Theft of user session identifiers', 4, 3, 'Verify session cookies use HttpOnly, Secure, and SameSite attributes.'),
('Sensitive Data Exposure', 'No HTTPS / TLS', 'Data transmitted in cleartext over the network', 4, 4, 'Verify TLS certificate is valid and HTTPS is enforced for all traffic.'),
('Sensitive Data Exposure', 'Weak Encryption', 'Use of outdated or vulnerable encryption algorithms', 4, 3, 'Verify use of modern encryption (AES-256) and strong hashing (Argon2/BCrypt).'),
('Sensitive Data Exposure', 'Exposed Database Backup', 'Publicly accessible database dumps or backups', 5, 2, 'Verify backup storage locations are restricted and encrypted at rest.'),
('Access Control Failures', 'IDOR (Insecure Direct Object Reference)', 'Accessing resources by manipulating identifiers', 4, 3, 'Verify server-side authorization checks for every resource access attempt.'),
('Access Control Failures', 'Privilege Escalation', 'A user gaining higher-level access than intended', 5, 2, 'Verify principle of least privilege is applied to all user roles.'),
('Security Misconfiguration', 'Default Credentials', 'Using factory-set usernames and passwords', 5, 3, 'Verify all default administrative passwords have been changed.'),
('Security Misconfiguration', 'Directory Listing Enabled', 'Web server exposing file list for directories', 2, 4, 'Verify directory indexing is disabled on all web server configurations.'),
('Security Misconfiguration', 'Exposed Admin Panel', 'Management interfaces accessible from the public internet', 4, 3, 'Verify admin panels are restricted to internal networks or VPNs.'),
('Security Misconfiguration', 'Open Unnecessary Ports', 'Non-essential services exposed on the network', 3, 4, 'Verify firewall rules block all ports except those explicitly required.'),
('Cross-Site Attacks', 'Cross-Site Scripting (XSS)', 'Executing malicious scripts in a user''s browser', 3, 4, 'Verify output encoding and Content Security Policy (CSP) implementation.'),
('Cross-Site Attacks', 'Cross-Site Request Forgery (CSRF)', 'Tricking a user into performing unwanted actions', 3, 3, 'Verify anti-CSRF tokens are used for all state-changing operations.'),
('Logging & Monitoring Failure', 'No Audit Logs', 'Absence of records for security-critical events', 2, 5, 'Verify audit logging is enabled for authentication and data modification events.'),
('Dependency & Software Issues', 'Outdated Server Software', 'Running web or application servers with known bugs', 4, 4, 'Verify software patch management process and use of supported versions.');
