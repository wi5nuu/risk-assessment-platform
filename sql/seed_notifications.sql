-- Seeding 10 professional sample notifications for the Admin user
INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'Welcome to Risk Shield Elite', 'Welcome to the platform! I am your AI assistant, ready to help you manage your organization''s risk posture.', 'success', 'system', false, NOW() - INTERVAL '1 minute'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'Critical: High Risk Detected', 'An Existential Operational Threat was detected in the latest audit. Risk Score: 25.', 'error', 'security', false, NOW() - INTERVAL '5 minutes'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'Database Backup Successful', 'Daily automated backup of the Risk Register for "President University" completed.', 'success', 'database', true, NOW() - INTERVAL '15 minutes'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'New Audit Project Created', 'Auditor Chris started a new assessment: "Data Privacy Q1 2026".', 'info', 'project', false, NOW() - INTERVAL '30 minutes'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'Warning: Failed Login Attempt', 'Three failed login attempts were detected from an unrecognized IP in Indonesia.', 'warning', 'security', false, NOW() - INTERVAL '1 hour'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'Organization Profile Updated', 'Admin Wisnu updated the organization contact details and security policy.', 'info', 'system', true, NOW() - INTERVAL '2 hours'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'AI Security Advisor Updated', 'The AI model has been updated with the latest OCTAVE Allegro threat patterns.', 'success', 'system', false, NOW() - INTERVAL '4 hours'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'System Maintenance Notice', 'Scheduled server maintenance tomorrow at 02:00 UTC. Expect 5 mins of downtime.', 'info', 'system', false, NOW() - INTERVAL '6 hours'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'Database Index Optimized', 'System automatically optimized performance for the large Risk Register table.', 'success', 'database', true, NOW() - INTERVAL '12 hours'
FROM user_profiles WHERE role = 'admin' LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at)
SELECT id, 'Project Report Exported', 'The "Annual Security Audit" report was exported in XLSX format by Chris.', 'info', 'project', true, NOW() - INTERVAL '24 hours'
FROM user_profiles WHERE role = 'admin' LIMIT 1;
