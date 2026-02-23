/**
 * API Route: Reports
 * Generate risk assessment reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calculateRiskDistribution, determineFinalOpinion } from '@/lib/risk-engine'

// GET /api/reports - Generate report
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const reportType = searchParams.get('type') || 'executive'

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Fetch all project data
    const [
      projectRes,
      criteriaRes,
      assetsRes,
      containersRes,
      concernsRes,
      scenariosRes,
      risksRes,
      analysesRes,
      mitigationsRes,
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('risk_measurement_criteria').select('*').eq('project_id', projectId).single(),
      supabase.from('assets').select('*').eq('project_id', projectId).eq('is_active', true),
      supabase.from('containers').select('*').eq('project_id', projectId).eq('is_active', true),
      supabase.from('concerns').select('*').eq('project_id', projectId).eq('is_active', true),
      supabase.from('threat_scenarios').select('*').eq('project_id', projectId).eq('is_active', true),
      supabase.from('risks').select('*').eq('project_id', projectId).eq('is_active', true),
      supabase.from('risk_analysis').select('*').eq('project_id', projectId),
      supabase.from('mitigation_plans').select('*').eq('project_id', projectId).eq('is_active', true),
    ])

    if (projectRes.error) throw projectRes.error

    const risks = risksRes.data || []
    const riskDistribution = calculateRiskDistribution(risks)
    const finalOpinion = determineFinalRiskOpinion(riskDistribution)

    // Generate report data based on type
    const reportData = {
      project: projectRes.data,
      criteria: criteriaRes.data,
      assets: assetsRes.data || [],
      containers: containersRes.data || [],
      concerns: concernsRes.data || [],
      threatScenarios: scenariosRes.data || [],
      risks,
      analyses: analysesRes.data || [],
      mitigationPlans: mitigationsRes.data || [],
      summary: {
        totalRisks: risks.length,
        ...riskDistribution,
        finalOpinion,
      },
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
    }

    return NextResponse.json({ data: reportData })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function determineFinalRiskOpinion(distribution: {
  critical: number
  high: number
  medium: number
  low: number
}): string {
  if (distribution.critical > 0) {
    return 'Immediate Remediation Required'
  }
  if (distribution.high > distribution.medium && distribution.high > distribution.low) {
    return 'High Risk Exposure'
  }
  if (distribution.medium >= distribution.high && distribution.medium > distribution.low) {
    return 'Moderate Risk Exposure'
  }
  return 'Acceptable Risk Level'
}
