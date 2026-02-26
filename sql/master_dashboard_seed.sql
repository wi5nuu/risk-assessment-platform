-- =====================================================
-- Master Data Seed: Risks, Assets, & Scenarios
-- Jalankan ini di Supabase SQL Editor
-- Untuk mengisi dashboard agar statistik tidak lagi 0
-- =====================================================

DO $$
DECLARE
    v_org_id UUID;
    v_profile_id UUID;
    v_proj RECORD;
    v_asset_id UUID;
    v_container_id UUID;
    v_concern_id UUID;
    v_scenario_id UUID;
BEGIN
    -- 1. Ambil organisasi dan auditor profil aktif
    SELECT organization_id, created_by 
    INTO v_org_id, v_profile_id 
    FROM projects 
    WHERE name LIKE '%Public Web Application%' 
    LIMIT 1;

    IF v_org_id IS NULL THEN
        SELECT organization_id, id INTO v_org_id, v_profile_id 
        FROM user_profiles 
        WHERE role = 'auditor' 
        LIMIT 1;
    END IF;

    -- 2. Loop melalui 5 proyek terbaru untuk mengisi data risiko
    FOR v_proj IN (
        SELECT id, name FROM projects 
        WHERE organization_id = v_org_id 
        AND created_by = v_profile_id
        ORDER BY created_at DESC 
        LIMIT 10
    ) LOOP
        
        -- A. Masukkan Asset (Bahan Utama Dashboard "Top Vulnerable Assets")
        INSERT INTO assets (project_id, name, asset_type, classification, confidentiality_value, integrity_value, availability_value, financial_impact, operational_impact, created_by)
        VALUES (v_proj.id, 'Core Database (' || v_proj.name || ')', 'data', 'confidential', 5, 5, 4, 5, 4, v_profile_id)
        RETURNING id INTO v_asset_id;

        -- B. Masukkan Container
        INSERT INTO containers (project_id, name, container_type, created_by)
        VALUES (v_proj.id, 'Cloud Production Environment', 'technical', v_profile_id)
        RETURNING id INTO v_container_id;

        -- C. Masukkan Concern
        INSERT INTO concerns (project_id, container_id, description, concern_category, priority, identified_by)
        VALUES (v_proj.id, v_container_id, 'Unauthorized data access via web vulnerabilities', 'confidentiality', 'high', v_profile_id)
        RETURNING id INTO v_concern_id;

        -- D. Masukkan Threat Scenario
        INSERT INTO threat_scenarios (project_id, concern_id, asset_id, container_id, scenario_description, threat_actor_type, likelihood, created_by)
        VALUES (v_proj.id, v_concern_id, v_asset_id, v_container_id, 'Sophisticated SQL Injection attacking the primary database', 'external_attacker', 4, v_profile_id)
        RETURNING id INTO v_scenario_id;

        -- E. MASUKKAN RISIKO (Kunci utama Dashboard Stats)
        -- Risiko 1: CRITICAL (Likelihood 5 x Impact 5 = 25)
        INSERT INTO risks (project_id, asset_id, threat_scenario_id, risk_title, risk_description, vulnerability_description, likelihood, impact, financial_impact, reputational_impact, status, identified_by)
        VALUES (v_proj.id, v_asset_id, v_scenario_id, 'High-Impact Data Breach', 'Potential leakage of entire student/client database.', 'Lack of WAF and parameterized queries.', 5, 5, 5, 5, 'identified', v_profile_id);

        -- Risiko 2: HIGH (Likelihood 4 x Impact 3 = 12)
        INSERT INTO risks (project_id, asset_id, threat_scenario_id, risk_title, risk_description, vulnerability_description, likelihood, impact, financial_impact, reputational_impact, status, identified_by)
        VALUES (v_proj.id, v_asset_id, v_scenario_id, 'Service Disruption (DDoS)', 'Temporary unavailability of core API services.', 'Insufficient rate limiting.', 4, 3, 3, 2, 'analyzed', v_profile_id);

        -- Risiko 3: MEDIUM (Likelihood 2 x Impact 3 = 6)
        INSERT INTO risks (project_id, asset_id, threat_scenario_id, risk_title, risk_description, vulnerability_description, likelihood, impact, financial_impact, reputational_impact, status, identified_by)
        VALUES (v_proj.id, v_asset_id, v_scenario_id, 'Unauthorized Audit Log Modification', 'Potential tampering of access logs.', 'Weak file permissions on log directory.', 2, 3, 1, 3, 'mitigating', v_profile_id);

    END LOOP;

    RAISE NOTICE 'Dashboard has been brought to life with Risks and Assets!';
END $$;
