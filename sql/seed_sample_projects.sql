-- =====================================================
-- Professional Auditor Pack: 5 Sample Projects & Audit Data
-- Run this in Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
    v_org_id UUID;
    v_profile_id UUID;
    v_project_id UUID;
    v_checklist_id UUID;
BEGIN
    -- 1. Identify the 'Home' (Organization) and 'Identity' (Auth)
    -- We search for the specific project name you already have
    SELECT organization_id, created_by 
    INTO v_org_id, v_profile_id 
    FROM projects 
    WHERE name LIKE '%Public Web Application%' 
    LIMIT 1;

    -- Fallback: If not found, use any existing auditor profile
    IF v_org_id IS NULL THEN
        SELECT organization_id, id INTO v_org_id, v_profile_id 
        FROM user_profiles 
        WHERE role = 'auditor' 
        LIMIT 1;
    END IF;

    -- Stop if still not found
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'COULD NOT FIND VALID ORG/PROFILE. Please ensure you have at least one project created.';
    END IF;

    -- 2. Define Sample Project Data
    -- We will loop and create 5 projects with accompanying checklists
    FOR i IN 1..5 LOOP
        INSERT INTO projects (
            organization_id, 
            name, 
            description, 
            status, 
            current_step, 
            created_by, 
            is_active, 
            target_completion_date
        )
        VALUES (
            v_org_id, 
            CASE i 
                WHEN 1 THEN 'Financial Core System Audit 2026'
                WHEN 2 THEN 'Cloud Infrastructure ISO Review'
                WHEN 3 THEN 'Payment Gateway PCI Validation'
                WHEN 4 THEN 'Internal HR Data Privacy Audit'
                WHEN 5 THEN 'Mobile Ops Endpoint Pentest'
            END,
            'Professional cybersecurity audit sample data for system demonstration.',
            CASE i % 3 WHEN 0 THEN 'completed' WHEN 1 THEN 'in_progress' ELSE 'draft' END,
            CASE i % 4 + 1 WHEN 1 THEN 1 WHEN 2 THEN 3 WHEN 3 THEN 5 ELSE 8 END,
            v_profile_id,
            TRUE,
            CURRENT_DATE + (interval '30 days')
        )
        RETURNING id INTO v_project_id;

        -- Create Risk Measurement Criteria (Step 1)
        INSERT INTO risk_measurement_criteria (project_id, created_by)
        VALUES (v_project_id, v_profile_id);

        -- Create Audit Checklist
        INSERT INTO audit_checklists (project_id, framework, status)
        VALUES (v_project_id, 'OCTAVE Allegro / ISO 27001', CASE i % 3 WHEN 0 THEN 'completed' ELSE 'in_progress' END)
        RETURNING id INTO v_checklist_id;

        -- Create 3-4 Audit Items for each
        INSERT INTO audit_items (checklist_id, category, control_title, control_description, compliance_status, auditor_comments)
        VALUES 
        (v_checklist_id, 'Access Control', 'Strong Password Policy', 'Verify 8+ chars and complexity', 
         CASE i % 2 WHEN 0 THEN 'compliant' ELSE 'partially_compliant' END, 'Verified against group policy.'),
        (v_checklist_id, 'Encryption', 'TLS 1.3 Implementation', 'Ensure no outdated SSL/TLS', 
         'compliant', 'Scan results confirm TLS 1.3 across all endpoints.'),
        (v_checklist_id, 'Incident Management', 'IRP Documentation', 'Incident Response Plan current version', 
         CASE i % 3 WHEN 0 THEN 'compliant' WHEN 1 THEN 'non_compliant' ELSE 'partially_compliant' END, 'Action required on testing cadence.');
    END LOOP;

    RAISE NOTICE 'Success! 5 Projects and 15+ Audit Items seeded successfully.';
END $$;
