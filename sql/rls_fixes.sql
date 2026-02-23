-- =====================================================
-- RLS Policy Fixes for Risk Assessment Wizard
-- Run this in your Supabase SQL Editor
-- Safe to re-run: drops existing policies first
-- =====================================================

-- 1. Risk Measurement Criteria
DROP POLICY IF EXISTS criteria_insert_policy ON risk_measurement_criteria;
CREATE POLICY criteria_insert_policy ON risk_measurement_criteria
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = risk_measurement_criteria.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS criteria_update_policy ON risk_measurement_criteria;
CREATE POLICY criteria_update_policy ON risk_measurement_criteria
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = risk_measurement_criteria.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 2. Assets
DROP POLICY IF EXISTS assets_insert_policy ON assets;
CREATE POLICY assets_insert_policy ON assets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = assets.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS assets_update_policy ON assets;
CREATE POLICY assets_update_policy ON assets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = assets.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS assets_delete_policy ON assets;
CREATE POLICY assets_delete_policy ON assets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = assets.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 3. Containers
DROP POLICY IF EXISTS containers_insert_policy ON containers;
CREATE POLICY containers_insert_policy ON containers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = containers.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS containers_update_policy ON containers;
CREATE POLICY containers_update_policy ON containers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = containers.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS containers_delete_policy ON containers;
CREATE POLICY containers_delete_policy ON containers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = containers.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 4. Asset Container Mapping
DROP POLICY IF EXISTS mapping_select_policy ON asset_container_mapping;
CREATE POLICY mapping_select_policy ON asset_container_mapping
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assets
            JOIN projects ON projects.id = assets.project_id
            WHERE assets.id = asset_container_mapping.asset_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS mapping_insert_policy ON asset_container_mapping;
CREATE POLICY mapping_insert_policy ON asset_container_mapping
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM assets
            JOIN projects ON projects.id = assets.project_id
            WHERE assets.id = asset_container_mapping.asset_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS mapping_delete_policy ON asset_container_mapping;
CREATE POLICY mapping_delete_policy ON asset_container_mapping
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM assets
            JOIN projects ON projects.id = assets.project_id
            WHERE assets.id = asset_container_mapping.asset_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 5. Concerns
DROP POLICY IF EXISTS concerns_insert_policy ON concerns;
CREATE POLICY concerns_insert_policy ON concerns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = concerns.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS concerns_update_policy ON concerns;
CREATE POLICY concerns_update_policy ON concerns
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = concerns.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS concerns_delete_policy ON concerns;
CREATE POLICY concerns_delete_policy ON concerns
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = concerns.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 6. Threat Scenarios
DROP POLICY IF EXISTS threat_scenarios_insert_policy ON threat_scenarios;
CREATE POLICY threat_scenarios_insert_policy ON threat_scenarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = threat_scenarios.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS threat_scenarios_update_policy ON threat_scenarios;
CREATE POLICY threat_scenarios_update_policy ON threat_scenarios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = threat_scenarios.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS threat_scenarios_delete_policy ON threat_scenarios;
CREATE POLICY threat_scenarios_delete_policy ON threat_scenarios
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = threat_scenarios.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 7. Risks
DROP POLICY IF EXISTS risks_insert_policy ON risks;
CREATE POLICY risks_insert_policy ON risks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = risks.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS risks_update_policy ON risks;
CREATE POLICY risks_update_policy ON risks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = risks.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS risks_delete_policy ON risks;
CREATE POLICY risks_delete_policy ON risks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = risks.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 8. Risk Analysis
DROP POLICY IF EXISTS risk_analysis_insert_policy ON risk_analysis;
CREATE POLICY risk_analysis_insert_policy ON risk_analysis
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = risk_analysis.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS risk_analysis_update_policy ON risk_analysis;
CREATE POLICY risk_analysis_update_policy ON risk_analysis
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = risk_analysis.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

-- 9. Mitigation Plans
DROP POLICY IF EXISTS mitigation_plans_insert_policy ON mitigation_plans;
CREATE POLICY mitigation_plans_insert_policy ON mitigation_plans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = mitigation_plans.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS mitigation_plans_update_policy ON mitigation_plans;
CREATE POLICY mitigation_plans_update_policy ON mitigation_plans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = mitigation_plans.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );

DROP POLICY IF EXISTS mitigation_plans_delete_policy ON mitigation_plans;
CREATE POLICY mitigation_plans_delete_policy ON mitigation_plans
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = mitigation_plans.project_id
            AND projects.organization_id = get_user_org_id()
        )
    );
