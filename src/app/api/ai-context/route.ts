import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Organization Info
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('organization_id')
            .eq('user_id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const orgId = (profile as any).organization_id;

        // 2. Fetch Aggregated Context
        // 2. Fetch Aggregated Context
        const [projectsRes, risksRes, findingsRes, orgRes, usersRes, assetsRes, threatsRes, mitigationRes] = await Promise.all([
            // All projects
            supabase.from('projects').select('id, name, industry, status, is_active').eq('organization_id', orgId),
            // Top critical/high risks across all projects
            supabase.from('risks').select('risk_title, risk_level, risk_score, status, project_id').eq('is_active', true).order('risk_score', { ascending: false }).limit(10),
            // Recent findings
            supabase.from('audit_findings').select('id, issue, severity').limit(5),
            // Organization details
            supabase.from('organizations').select('name, industry, description').eq('id', orgId).single(),
            // User count
            supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
            // Assets
            supabase.from('assets').select('name, asset_type, overall_criticality').eq('is_active', true).limit(10),
            // Threats
            supabase.from('threat_scenarios').select('scenario_description, threat_actor_type').eq('is_active', true).limit(10),
            // Mitigations
            supabase.from('mitigation_plans').select('mitigation_description, status, priority').eq('is_active', true).limit(5)
        ]);

        const context = {
            organization: orgRes.data as any,
            projectCount: (projectsRes.data as any[])?.length || 0,
            activeProjectCount: (projectsRes.data as any[])?.filter((p: any) => p.is_active).length || 0,
            projects: (projectsRes.data as any[])?.map((p: any) => ({ name: p.name, status: p.status, isActive: p.is_active })),
            userCount: usersRes.count || 0,
            topRisks: risksRes.data as any[],
            assets: assetsRes.data as any[],
            threats: threatsRes.data as any[],
            mitigations: mitigationRes.data as any[],
            recentFindings: findingsRes.data as any[],
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(context);
    } catch (error: any) {
        console.error('AI Context API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to aggregate AI context' },
            { status: 500 }
        );
    }
}
