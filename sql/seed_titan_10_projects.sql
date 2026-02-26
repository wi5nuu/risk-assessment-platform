-- =====================================================
-- TITAN PACK: 10 Ultra-High-End Global Projects
-- Jalankan ini di Supabase SQL Editor
-- Proyek skala internasional & infrastruktur kritis
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

    -- 2. Memasukkan 10 Proyek "Titan Class"
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
                WHEN 1 THEN 'StarLink Security: Satellite Telemetry Encryption'
                WHEN 2 THEN 'BioGuard: Genomic Data Privacy Audit'
                WHEN 3 THEN 'SolarGrid: Distributed Renewable Energy Security'
                WHEN 4 THEN 'NeuroLink: Brain-Computer Interface (BCI) Integrity'
                WHEN 5 THEN 'CryptoCustody: Multi-Sig Cold Storage Audit'
                WHEN 6 THEN 'DeepSea: Underwater Fiber Infrastructure Protection'
                WHEN 7 THEN 'SkyNet: Autonomous Drone Swarm Traffic Control'
                WHEN 8 THEN 'Mars-1: Interplanetary Communication Security'
                WHEN 9 THEN 'QuantumBridge: Post-Quantum TLS Implementation'
                WHEN 10 THEN 'GlobalHealth: Pandemic Surveillance Data Integrity'
            END,
            CASE i
                WHEN 1 THEN 'Securing the ground-to-satellite telemetry uplinks against sophisticated signal jamming and unauthorized command injection.'
                WHEN 2 THEN 'Comprehensive audit of genomic sequence storage and sharing protocols, ensuring compliance with strict international privacy laws.'
                WHEN 3 THEN 'Assessing the security of edge-computing nodes in a distributed smart grid for national renewable energy distribution.'
                WHEN 4 THEN 'Technical risk assessment of data integrity for neural implants and brain-computer interfaces against malicious signal manipulation.'
                WHEN 5 THEN 'Deep-dive security review of institutional-grade cryptocurrency cold storage systems and multi-signature governance.'
                WHEN 6 THEN 'Monitoring and protecting trans-continental underwater fiber optic cables against physical tampering and signal interception.'
                WHEN 7 THEN 'Securing the real-time encrypted communications for urban autonomous drone delivery systems.'
                WHEN 8 THEN 'Establishing secured, high-latency communication protocols for the first human mission telemetry and habitat control.'
                WHEN 9 THEN 'Validation of new lattice-based cryptographic standards across all high-security internal APIs.'
                WHEN 10 THEN 'Ensuring the integrity of global infectious disease tracking data and cross-border verified health certifications.'
            END,
            CASE i % 3 WHEN 0 THEN 'completed' WHEN 1 THEN 'in_progress' ELSE 'draft' END,
            CASE i % 4 + 4 WHEN 4 THEN 5 WHEN 5 THEN 6 WHEN 6 THEN 7 ELSE 8 END,
            v_profile_id,
            TRUE,
            CURRENT_DATE + (interval '90 days')
        )
        RETURNING id INTO v_project_id;

        -- Sinkronisasi Kriteria
        INSERT INTO risk_measurement_criteria (project_id, created_by)
        VALUES (v_project_id, v_profile_id);

        -- Audit Checklist
        INSERT INTO audit_checklists (project_id, framework, status)
        VALUES (v_project_id, 'Specialized Industrial / Military Standard', CASE i % 3 WHEN 0 THEN 'completed' ELSE 'in_progress' END)
        RETURNING id INTO v_checklist_id;

        -- Audit Items
        INSERT INTO audit_items (checklist_id, category, control_title, control_description, compliance_status)
        VALUES 
        (v_checklist_id, 'Advanced Encryption', 'Elliptic Curve Cryptography Verification', 'Verify key length and rotation cadence.', 'compliant'),
        (v_checklist_id, 'Physical Security', 'Anti-Tampering Sensors', 'Detection of physical breach in edge nodes.', 'compliant');

        -- Populate Dashboard Intelligence (Assets & Risks)
        INSERT INTO assets (project_id, name, asset_type, classification, confidentiality_value, integrity_value, availability_value, financial_impact, created_by)
        VALUES (v_project_id, 'Strategic Asset TITAN-' || i, 'system', 'confidential', 5, 5, 5, i % 3 + 3, v_profile_id)
        RETURNING id INTO v_asset_id;

        INSERT INTO containers (project_id, name, container_type, created_by)
        VALUES (v_project_id, 'Global Distributed Node Cluster', 'technical', v_profile_id)
        RETURNING id INTO v_container_id;

        INSERT INTO concerns (project_id, container_id, description, concern_category, identified_by)
        VALUES (v_project_id, v_container_id, 'High-level nation-state cyber espionage', 'confidentiality', v_profile_id)
        RETURNING id INTO v_concern_id;

        INSERT INTO threat_scenarios (project_id, concern_id, asset_id, container_id, scenario_description, likelihood, created_by)
        VALUES (v_project_id, v_concern_id, v_asset_id, v_container_id, 'Sophisticated APT intrusion scenario', 3 + (i % 2), v_profile_id)
        RETURNING id INTO v_scenario_id;

        -- Create Varying Risks (Mix of Critical and High)
        INSERT INTO risks (project_id, asset_id, threat_scenario_id, risk_title, vulnerability_description, likelihood, impact, identified_by)
        VALUES (v_project_id, v_asset_id, v_scenario_id, 'Global System Integrity Loss', 'Exploitation of fundamental protocol flaws.', 3 + (i % 3), 4 + (i % 2), v_profile_id);

    END LOOP;

    RAISE NOTICE 'TITAN PACK: 10 Ultra-High-End Projects seeded successfully!';
END $$;
