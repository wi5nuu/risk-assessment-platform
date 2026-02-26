-- =====================================================
-- Elite MEGA Pack: 10 High-End Enterprise Projects
-- Jalankan ini di Supabase SQL Editor
-- Menghasilkan 10 Proyek + Dashboard Stats + Audit Data
-- =====================================================

DO $$
DECLARE
    v_org_id UUID;
    v_profile_id UUID;
    v_project_id UUID;
    v_checklist_id UUID;
    v_asset_id UUID;
    v_container_id UUID;
    v_concern_id UUID;
    v_scenario_id UUID;
BEGIN
    -- 1. Deteksi Identitas (Org & Profile) Anda
    SELECT organization_id, created_by 
    INTO v_org_id, v_profile_id 
    FROM projects 
    WHERE name LIKE '%Public Web Application%' 
    LIMIT 1;

    -- Backup: Jika profil tidak ditemukan lewat proyek, cari lewat role Auditor
    IF v_org_id IS NULL THEN
        SELECT organization_id, id INTO v_org_id, v_profile_id 
        FROM user_profiles 
        WHERE role = 'auditor' 
        LIMIT 1;
    END IF;

    -- 2. Memasukkan 10 Proyek Strategis
    FOR i IN 1..10 LOOP
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
                WHEN 1 THEN 'Project Phoenix: Resilience of Digital Banking Core'
                WHEN 2 THEN 'AI Governance: Generative AI Risk Management'
                WHEN 3 THEN 'Supply Chain Integrity: Vendor Security Audit'
                WHEN 4 THEN 'Cyber Insurance Readiness: Controls Validation'
                WHEN 5 THEN 'Project Titan: Secure High-Frequency Trading'
                WHEN 6 THEN 'IoT Ecosystem Security: Smart City Infrastructure'
                WHEN 7 THEN 'HealthLink: PHI Protection & HIPAA Alignment'
                WHEN 8 THEN 'Project Valkyrie: Anti-Ransomware Recovery Strategy'
                WHEN 9 THEN 'Open Finance: PSD3 Compliance Readiness'
                WHEN 10 THEN 'Secure DevOps: CI/CD Pipeline Integrity Audit'
            END,
            CASE i
                WHEN 1 THEN 'Comprehensive resilience assessment of the digital banking core infrastructure against systemic failure scenarios.'
                WHEN 2 THEN 'Establishing a risk management framework for the deployment of Large Language Models (LLMs) in corporate environments.'
                WHEN 3 THEN 'Deep-dive security audit of Tier-1 software vendors to prevent supply chain attacks like SolarWinds.'
                WHEN 4 THEN 'Technical validation of security controls required for $100M+ cyber insurance policy underwriting.'
                WHEN 5 THEN 'Security audit of low-latency high-frequency trading platforms against algorithmic manipulation and technical theft.'
                WHEN 6 THEN 'Assessing the security posture of distributed smart city sensors and unified management dashboards.'
                WHEN 7 THEN 'Protected Health Information (PHI) audit for the integrated patient management system and mobile app.'
                WHEN 8 THEN 'Validating immutable backup strategies and rapid restoration capabilities in a post-ransomware scenario.'
                WHEN 9 THEN 'Pre-audit for Payment Services Directive 3 (PSD3) compliance and secure customer authentication protocols.'
                WHEN 10 THEN 'Security review of the automated software delivery pipeline, focusing on secret management and image signing.'
            END,
            CASE i % 3 WHEN 0 THEN 'completed' WHEN 1 THEN 'in_progress' ELSE 'draft' END,
            CASE i % 4 + 4 WHEN 4 THEN 4 WHEN 5 THEN 5 WHEN 6 THEN 6 ELSE 8 END,
            v_profile_id,
            TRUE,
            CURRENT_DATE + (interval '60 days')
        )
        RETURNING id INTO v_project_id;

        -- Step 1: Risk Measurement Criteria
        INSERT INTO risk_measurement_criteria (project_id, created_by)
        VALUES (v_project_id, v_profile_id);

        -- Audit Checklist
        INSERT INTO audit_checklists (project_id, framework, status)
        VALUES (v_project_id, 'NIST 800-53 / ISO 27001', CASE i % 3 WHEN 0 THEN 'completed' ELSE 'in_progress' END)
        RETURNING id INTO v_checklist_id;

        -- Audit Items
        INSERT INTO audit_items (checklist_id, category, control_title, control_description, compliance_status)
        VALUES 
        (v_checklist_id, 'Governance', 'Security Awareness Training', 'Periodic training for all employees', 'compliant'),
        (v_checklist_id, 'Technical', 'Encryption at Rest', 'FIPS 140-2 validated module enforcement', 'partially_compliant');

        -- Populate Dashboard Intelligence (Assets & Risks)
        INSERT INTO assets (project_id, name, asset_type, classification, confidentiality_value, integrity_value, availability_value, financial_impact, created_by)
        VALUES (v_project_id, 'Strategic Asset ' || i, 'system', 'restricted', 5, 5, 5, 5, v_profile_id)
        RETURNING id INTO v_asset_id;

        INSERT INTO containers (project_id, name, container_type, created_by)
        VALUES (v_project_id, 'Enterprise Datacenter', 'technical', v_profile_id)
        RETURNING id INTO v_container_id;

        INSERT INTO concerns (project_id, container_id, description, concern_category, identified_by)
        VALUES (v_project_id, v_container_id, 'Advanced Persistent Threat (APT) risk', 'confidentiality', v_profile_id)
        RETURNING id INTO v_concern_id;

        INSERT INTO threat_scenarios (project_id, concern_id, asset_id, container_id, scenario_description, likelihood, created_by)
        VALUES (v_project_id, v_concern_id, v_asset_id, v_container_id, 'State-sponsored threat actor infiltration', 4, v_profile_id)
        RETURNING id INTO v_scenario_id;

        -- Create CRITICAL Risk (5x5 = 25)
        INSERT INTO risks (project_id, asset_id, threat_scenario_id, risk_title, vulnerability_description, likelihood, impact, identified_by)
        VALUES (v_project_id, v_asset_id, v_scenario_id, 'Strategic System Failure', 'Exploitation of zero-day vulnerabilities in the core stack.', 5, 5, v_profile_id);

    END LOOP;

    RAISE NOTICE 'MEGA PACK: 10 Elite Projects seeded successfully!';
END $$;
