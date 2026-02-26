-- =====================================================
-- AI Insights Persistence Layer
-- Jalankan ini di Supabase SQL Editor
-- Untuk menyimpan hasil analisis AI agar muncul di Report
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) DEFAULT 'analysis' CHECK (insight_type IN ('analysis', 'chat_summary', 'recommendation')),
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID REFERENCES user_profiles(id),
    UNIQUE(project_id, insight_type)
);

-- Enable RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY ai_insights_select_policy ON ai_insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            JOIN user_profiles ON user_profiles.organization_id = projects.organization_id
            WHERE projects.id = ai_insights.project_id
            AND user_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY ai_insights_insert_policy ON ai_insights
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'auditor')
        )
    );

CREATE POLICY ai_insights_update_policy ON ai_insights
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'auditor')
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
