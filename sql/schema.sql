-- =====================================================
-- OCTAVE Allegro Risk Assessment Platform
-- Database Schema
-- PostgreSQL with Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS & ORGANIZATIONS
-- =====================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    size VARCHAR(50),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'auditor', 'viewer')),
    department VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- =====================================================
-- 2. PROJECTS
-- =====================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
    current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 8),
    step_1_completed BOOLEAN DEFAULT FALSE,
    step_2_completed BOOLEAN DEFAULT FALSE,
    step_3_completed BOOLEAN DEFAULT FALSE,
    step_4_completed BOOLEAN DEFAULT FALSE,
    step_5_completed BOOLEAN DEFAULT FALSE,
    step_6_completed BOOLEAN DEFAULT FALSE,
    step_7_completed BOOLEAN DEFAULT FALSE,
    step_8_completed BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    assigned_to UUID REFERENCES user_profiles(id),
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 3. STEP 1: RISK MEASUREMENT CRITERIA
-- =====================================================

CREATE TABLE risk_measurement_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- Impact Criteria (1-5 scale descriptions)
    financial_impact_1 VARCHAR(255) DEFAULT 'Negligible (< $1K)',
    financial_impact_2 VARCHAR(255) DEFAULT 'Minor ($1K - $10K)',
    financial_impact_3 VARCHAR(255) DEFAULT 'Moderate ($10K - $100K)',
    financial_impact_4 VARCHAR(255) DEFAULT 'Major ($100K - $1M)',
    financial_impact_5 VARCHAR(255) DEFAULT 'Catastrophic (> $1M)',
    
    reputational_impact_1 VARCHAR(255) DEFAULT 'Negligible impact',
    reputational_impact_2 VARCHAR(255) DEFAULT 'Minor negative attention',
    reputational_impact_3 VARCHAR(255) DEFAULT 'Moderate public concern',
    reputational_impact_4 VARCHAR(255) DEFAULT 'Major reputation damage',
    reputational_impact_5 VARCHAR(255) DEFAULT 'Severe loss of trust',
    
    legal_impact_1 VARCHAR(255) DEFAULT 'No legal implications',
    legal_impact_2 VARCHAR(255) DEFAULT 'Minor compliance issue',
    legal_impact_3 VARCHAR(255) DEFAULT 'Regulatory investigation',
    legal_impact_4 VARCHAR(255) DEFAULT 'Legal proceedings',
    legal_impact_5 VARCHAR(255) DEFAULT 'Severe penalties/criminal',
    
    operational_impact_1 VARCHAR(255) DEFAULT 'Negligible disruption',
    operational_impact_2 VARCHAR(255) DEFAULT 'Minor service degradation',
    operational_impact_3 VARCHAR(255) DEFAULT 'Moderate disruption',
    operational_impact_4 VARCHAR(255) DEFAULT 'Major service outage',
    operational_impact_5 VARCHAR(255) DEFAULT 'Complete operational halt',
    
    -- Likelihood Criteria (1-5 scale descriptions)
    likelihood_1 VARCHAR(255) DEFAULT 'Rare (once in 5+ years)',
    likelihood_2 VARCHAR(255) DEFAULT 'Unlikely (once in 2-5 years)',
    likelihood_3 VARCHAR(255) DEFAULT 'Possible (once per year)',
    likelihood_4 VARCHAR(255) DEFAULT 'Likely (multiple times per year)',
    likelihood_5 VARCHAR(255) DEFAULT 'Almost Certain (monthly+)',
    
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- =====================================================
-- 4. STEP 2: INFORMATION ASSETS
-- =====================================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(100) NOT NULL CHECK (asset_type IN ('data', 'system', 'application', 'network', 'physical', 'service', 'personnel')),
    owner VARCHAR(255),
    custodian VARCHAR(255),
    classification VARCHAR(50) CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
    -- Security Attributes (Criticality)
    confidentiality_value INTEGER CHECK (confidentiality_value BETWEEN 1 AND 5),
    integrity_value INTEGER CHECK (integrity_value BETWEEN 1 AND 5),
    availability_value INTEGER CHECK (availability_value BETWEEN 1 AND 5),
    overall_criticality INTEGER GENERATED ALWAYS AS (
        GREATEST(confidentiality_value, integrity_value, availability_value)
    ) STORED,
    location VARCHAR(255),
    retention_period VARCHAR(100),
    -- Impact Values (from Step 1 criteria)
    financial_impact INTEGER CHECK (financial_impact BETWEEN 1 AND 5),
    reputational_impact INTEGER CHECK (reputational_impact BETWEEN 1 AND 5),
    legal_impact INTEGER CHECK (legal_impact BETWEEN 1 AND 5),
    operational_impact INTEGER CHECK (operational_impact BETWEEN 1 AND 5),
    max_impact INTEGER GENERATED ALWAYS AS (
        GREATEST(COALESCE(financial_impact, 1), COALESCE(reputational_impact, 1), COALESCE(legal_impact, 1), COALESCE(operational_impact, 1))
    ) STORED,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 5. STEP 3: INFORMATION ASSET CONTAINERS
-- =====================================================

CREATE TABLE containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    container_type VARCHAR(100) NOT NULL CHECK (container_type IN ('physical', 'technical', 'people', 'process')),
    location VARCHAR(255),
    responsible_party VARCHAR(255),
    security_controls TEXT,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- Many-to-Many: Assets <-> Containers
CREATE TABLE asset_container_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'stored_in' CHECK (relationship_type IN ('stored_in', 'processed_in', 'transmitted_via', 'accessed_from')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, container_id, relationship_type)
);

-- =====================================================
-- 6. STEP 4: AREAS OF CONCERN
-- =====================================================

CREATE TABLE concerns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    concern_category VARCHAR(100) CHECK (concern_category IN ('confidentiality', 'integrity', 'availability', 'compliance', 'operational')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    identified_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 7. STEP 5: THREAT SCENARIOS
-- =====================================================

CREATE TABLE threat_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    concern_id UUID NOT NULL REFERENCES concerns(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    scenario_description TEXT NOT NULL,
    threat_actor VARCHAR(255),
    threat_actor_type VARCHAR(100) CHECK (threat_actor_type IN ('external_attacker', 'internal_attacker', 'competitor', 'nation_state', 'criminal', 'terrorist', 'activist', 'insider', 'accidental')),
    threat_vector VARCHAR(255),
    motivation VARCHAR(255),
    capability VARCHAR(50) CHECK (capability IN ('low', 'medium', 'high')),
    likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 8. STEP 6: RISKS
-- =====================================================

CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    threat_scenario_id UUID NOT NULL REFERENCES threat_scenarios(id) ON DELETE CASCADE,
    risk_title VARCHAR(255) NOT NULL,
    risk_description TEXT,
    vulnerability_description TEXT NOT NULL,
    -- Risk Scores (calculated by Risk Engine)
    likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
    impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
    risk_level VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN likelihood * impact <= 5 THEN 'low'
            WHEN likelihood * impact <= 10 THEN 'medium'
            WHEN likelihood * impact <= 15 THEN 'high'
            ELSE 'critical'
        END
    ) STORED,
    -- Impact breakdown
    financial_impact INTEGER CHECK (financial_impact BETWEEN 1 AND 5),
    reputational_impact INTEGER CHECK (reputational_impact BETWEEN 1 AND 5),
    legal_impact INTEGER CHECK (legal_impact BETWEEN 1 AND 5),
    operational_impact INTEGER CHECK (operational_impact BETWEEN 1 AND 5),
    -- Risk metadata
    status VARCHAR(50) DEFAULT 'identified' CHECK (status IN ('identified', 'analyzed', 'mitigating', 'accepted', 'transferred', 'avoided', 'closed')),
    owner VARCHAR(255),
    identified_by UUID NOT NULL REFERENCES user_profiles(id),
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    review_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for risk score queries
CREATE INDEX idx_risks_score ON risks(risk_score);
CREATE INDEX idx_risks_level ON risks(risk_level);
CREATE INDEX idx_risks_project ON risks(project_id);
CREATE INDEX idx_risks_asset ON risks(asset_id);

-- =====================================================
-- 9. STEP 7: RISK ANALYSIS
-- =====================================================

CREATE TABLE risk_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- Current controls assessment
    existing_controls TEXT,
    control_effectiveness INTEGER CHECK (control_effectiveness BETWEEN 1 AND 5),
    residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5),
    residual_risk_score INTEGER GENERATED ALWAYS AS (
        COALESCE(residual_likelihood, 0) * COALESCE(residual_impact, 0)
    ) STORED,
    -- Risk analysis details
    root_cause_analysis TEXT,
    potential_consequences TEXT,
    affected_stakeholders TEXT,
    -- Analysis metadata
    analyzed_by UUID NOT NULL REFERENCES user_profiles(id),
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(risk_id)
);

-- =====================================================
-- 10. STEP 8: MITIGATION PLANS
-- =====================================================

CREATE TABLE mitigation_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    treatment_strategy VARCHAR(50) NOT NULL CHECK (treatment_strategy IN ('mitigate', 'transfer', 'accept', 'avoid')),
    mitigation_description TEXT NOT NULL,
    -- Implementation details
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_cost VARCHAR(100),
    implementation_timeline VARCHAR(100),
    responsible_party VARCHAR(255),
    -- Status tracking
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'implemented', 'verified', 'cancelled')),
    planned_start_date DATE,
    planned_completion_date DATE,
    actual_start_date DATE,
    actual_completion_date DATE,
    -- Effectiveness
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    lessons_learned TEXT,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 11. AUDIT LOGS
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id),
    organization_id UUID REFERENCES organizations(id),
    project_id UUID REFERENCES projects(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_project ON audit_logs(project_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- 12. ATTACHMENTS
-- =====================================================

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- 13. ASSESSMENT VERSIONS
-- =====================================================

CREATE TABLE assessment_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_name VARCHAR(255),
    change_summary TEXT,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, version_number)
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_measurement_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_container_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitigation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_versions ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can view their own organization
CREATE POLICY org_select_policy ON organizations
    FOR SELECT USING (
        id = (SELECT organization_id FROM user_profiles WHERE user_id = auth.uid())
    );

-- Allow authenticated users to create organizations
CREATE POLICY org_insert_policy ON organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Profiles: Users can view profiles in their organization
-- Use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM user_profiles WHERE user_id = auth.uid();
$$;

CREATE POLICY user_profile_select_policy ON user_profiles
    FOR SELECT USING (
        user_id = auth.uid() 
        OR 
        organization_id = get_user_org_id()
    );

CREATE POLICY user_profile_insert_policy ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profile_update_policy ON user_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Projects: Users can access projects in their organization
CREATE POLICY project_select_policy ON projects
    FOR SELECT USING (
        organization_id = get_user_org_id()
        AND deleted_at IS NULL
    );

CREATE POLICY project_insert_policy ON projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'auditor')
        )
    );

CREATE POLICY project_update_policy ON projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'auditor')
        )
    );

-- Risk Measurement Criteria
CREATE POLICY criteria_select_policy ON risk_measurement_criteria
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = risk_measurement_criteria.project_id
            AND user_profiles.user_id = auth.uid()
        )
    );

-- Assets
CREATE POLICY assets_select_policy ON assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = assets.project_id
            AND user_profiles.user_id = auth.uid()
            AND assets.deleted_at IS NULL
        )
    );

-- Containers
CREATE POLICY containers_select_policy ON containers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = containers.project_id
            AND user_profiles.user_id = auth.uid()
            AND containers.deleted_at IS NULL
        )
    );

-- Concerns
CREATE POLICY concerns_select_policy ON concerns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = concerns.project_id
            AND user_profiles.user_id = auth.uid()
            AND concerns.is_active = TRUE
        )
    );

-- Threat Scenarios
CREATE POLICY threat_scenarios_select_policy ON threat_scenarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = threat_scenarios.project_id
            AND user_profiles.user_id = auth.uid()
            AND threat_scenarios.is_active = TRUE
        )
    );

-- Risks
CREATE POLICY risks_select_policy ON risks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = risks.project_id
            AND user_profiles.user_id = auth.uid()
            AND risks.deleted_at IS NULL
        )
    );

-- Risk Analysis
CREATE POLICY risk_analysis_select_policy ON risk_analysis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = risk_analysis.project_id
            AND user_profiles.user_id = auth.uid()
        )
    );

-- Mitigation Plans
CREATE POLICY mitigation_plans_select_policy ON mitigation_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = mitigation_plans.project_id
            AND user_profiles.user_id = auth.uid()
            AND mitigation_plans.is_active = TRUE
        )
    );

-- Audit Logs
CREATE POLICY audit_logs_select_policy ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'auditor')
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_measurement_criteria_updated_at BEFORE UPDATE ON risk_measurement_criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON containers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concerns_updated_at BEFORE UPDATE ON concerns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_scenarios_updated_at BEFORE UPDATE ON threat_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_analysis_updated_at BEFORE UPDATE ON risk_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mitigation_plans_updated_at BEFORE UPDATE ON mitigation_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log function
CREATE OR REPLACE FUNCTION create_audit_log(
    p_user_id UUID,
    p_organization_id UUID,
    p_project_id UUID,
    p_action VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_old_values JSONB,
    p_new_values JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, organization_id, project_id, action, entity_type, entity_id,
        old_values, new_values
    ) VALUES (
        p_user_id, p_organization_id, p_project_id, p_action, p_entity_type, p_entity_id,
        p_old_values, p_new_values
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default organization
INSERT INTO organizations (name, description, industry, is_active)
VALUES ('Default Organization', 'Initial organization for setup', 'Technology', TRUE)
ON CONFLICT DO NOTHING;

-- Insert admin user profile (will be linked after auth user creation)
-- This is a placeholder - actual user creation should be done through Supabase Auth
