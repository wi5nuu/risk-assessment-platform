"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { FileText, Download, Loader2 } from 'lucide-react'

interface AuditReportProps {
    projectId: string
    checklistId: string | null
}

export function AuditReport({ projectId, checklistId }: AuditReportProps) {
    const supabase = createClient() as any
    const [isLoading, setIsLoading] = useState(true)
    const [reportData, setReportData] = useState<any>(null)

    useEffect(() => {
        loadReportData()
    }, [projectId, checklistId])

    const loadReportData = async () => {
        try {
            const [projectRes, risksRes, findingsRes, checklistRes, mitigationsRes, assetsRes, orgRes] = await Promise.all([
                supabase.from('projects').select('*').eq('id', projectId).single(),
                supabase.from('risks').select('*').eq('project_id', projectId).eq('is_active', true).order('risk_score', { ascending: false }),
                supabase.from('audit_findings').select('*').eq('project_id', projectId),
                checklistId
                    ? supabase.from('audit_checklists').select('*, audit_items(*)').eq('id', checklistId).single()
                    : Promise.resolve({ data: null }),
                supabase.from('mitigation_plans').select('*').eq('project_id', projectId),
                supabase.from('assets').select('*').eq('project_id', projectId).eq('is_active', true),
                supabase.from('organizations').select('*').limit(1).single(), // Get the org profile
            ])

            const risks = risksRes.data || []
            const findings = findingsRes.data || []
            const items = checklistRes.data?.audit_items || []
            const mitigations = mitigationsRes.data || []
            const assets = assetsRes.data || []
            const org = orgRes.data

            const applicable = items.filter((i: any) => i.compliance_status !== 'not_applicable')
            const compliant = items.filter((i: any) => i.compliance_status === 'compliant')
            const partial = items.filter((i: any) => i.compliance_status === 'partially_compliant')
            const score = applicable.length > 0 ? Math.round(((compliant.length + partial.length * 0.5) / applicable.length) * 100) : 0

            // Determine Audit Opinion (Module 11 Requirement 9)
            let opinion = 'Acceptable Risk'
            if (risks.some((r: any) => r.risk_level === 'critical') || score < 50) {
                opinion = 'Needs Immediate Action'
            } else if (score > 85 && risks.filter((r: any) => r.risk_level === 'critical' || r.risk_level === 'high').length === 0) {
                opinion = 'Secure'
            }

            setReportData({
                project: projectRes.data,
                org,
                risks,
                findings,
                checklist: checklistRes.data,
                items,
                assets,
                mitigations,
                score,
                opinion,
                summary: {
                    totalRisks: risks.length,
                    criticalRisks: risks.filter((r: any) => r.risk_level === 'critical').length,
                    highRisks: risks.filter((r: any) => r.risk_level === 'high').length,
                    totalFindings: findings.length,
                    criticalFindings: findings.filter((f: any) => f.severity === 'critical').length,
                    complianceScore: score,
                    totalControls: items.length,
                    framework: checklistRes.data?.framework || 'OCTAVE Allegro',
                    totalAssets: assets.length,
                },
            })
        } catch (err) {
            toast.error('Failed to load report data')
        } finally {
            setIsLoading(false)
        }
    }

    const exportReport = () => {
        if (!reportData) return

        const { project, org, summary, risks, findings, items, assets, opinion } = reportData
        const now = new Date().toLocaleString()

        let report = `
═══════════════════════════════════════════════════════════════
       CYBERSECURITY RISK ASSESSMENT & SECURITY AUDIT REPORT
═══════════════════════════════════════════════════════════════

CUSTOMER: ${org?.name || 'N/A'}
INDUSTRY: ${org?.industry || 'N/A'}
EXPOSURE LEVEL: ${org?.exposure_level || 'N/A'}

REPORT SUMMARY
──────────────
Project: ${project?.name || 'N/A'}
Framework: ${summary.framework}
Generated: ${now}
Final Opinion: ${opinion.toUpperCase()}

───────────────────────────────────────────────────────────────
1. EXECUTIVE SUMMARY
───────────────────────────────────────────────────────────────

This report presents the findings of the AI-assisted cybersecurity risk
assessment and security audit for "${project?.name}", belonging to ${org?.name}.
The assessment follows the ${summary.framework} methodology.

Key Metrics:
  • Compliance Score:          ${summary.complianceScore}%
  • Final Audit Opinion:       ${opinion}
  • Total Information Assets:  ${summary.totalAssets}
  • Total Risks Identified:    ${summary.totalRisks} (${summary.criticalRisks} Critical)
  • Security Audit Findings:   ${summary.totalFindings}

───────────────────────────────────────────────────────────────
2. SCOPE OF AUDIT
───────────────────────────────────────────────────────────────
The scope of this audit covers the technical and organizational 
security controls associated with "${project?.name}". This includes:
  • Asset management and criticality analysis.
  • Vulnerability identification (OWASP Top 10 based).
  • Risk scenario modeling for information assets.
  • Compliance verification against ${summary.framework} controls.

───────────────────────────────────────────────────────────────
3. METHODOLOGY (OCTAVE ALLEGRO)
───────────────────────────────────────────────────────────────
This system uses the OCTAVE Allegro methodology, a risk-centric approach
focused on information assets. The process involved:
  1. Establishing risk measurement criteria.
  2. Profiling information assets and mapping containers.
  3. Identifying areas of concern and threat scenarios.
  4. Calculating risk scores (Likelihood x Impact).
  5. Auditing security controls for identified risks.

───────────────────────────────────────────────────────────────
4. ASSET INVENTORY
───────────────────────────────────────────────────────────────
`
        assets.forEach((asset: any, idx: number) => {
            report += `${idx + 1}. [${asset.type}] ${asset.name}
   Owner: ${asset.owner} | Criticality: ${asset.criticality_score}/10
   CIA: C(${asset.confidentiality}) I(${asset.integrity}) A(${asset.availability})
`
        })

        report += `
───────────────────────────────────────────────────────────────
5. RISK ASSESSMENT
───────────────────────────────────────────────────────────────
`
        risks.forEach((risk: any, idx: number) => {
            report += `
${idx + 1}. ${risk.risk_title}
   Level: ${(risk.risk_level || 'N/A').toUpperCase()} | Score: ${risk.risk_score}
   Description: ${risk.vulnerability_description || 'N/A'}
   Mitigation Strategy: ${risk.mitigation_strategy || 'TBD'}
`
        })

        report += `
───────────────────────────────────────────────────────────────
6. COMPLIANCE RESULT (Score: ${summary.complianceScore}%)
───────────────────────────────────────────────────────────────
`
        if (items.length === 0) {
            report += '\n  No audit checklist items recorded.\n'
        } else {
            items.forEach((item: any) => {
                const status = item.compliance_status
                    ? item.compliance_status.replace('_', ' ').toUpperCase()
                    : 'UNREVIEWED'
                report += `  [${status}] ${item.control_title}\n`
            })
        }

        report += `
───────────────────────────────────────────────────────────────
7. AUDIT FINDINGS
───────────────────────────────────────────────────────────────
`
        if (findings.length === 0) {
            report += '\n  Audit verification successful. No critical gaps found.\n'
        } else {
            findings.forEach((f: any, idx: number) => {
                report += `
${idx + 1}. [${(f.severity || 'medium').toUpperCase()}] ${f.issue}
   Recommendation: ${f.recommendation || 'N/A'}
`
            })
        }

        report += `
───────────────────────────────────────────────────────────────
8. AI RECOMMENDATIONS & ADVICE (M10/M11 Bridge)
───────────────────────────────────────────────────────────────

Strategic Guidance:
  1. Focus remediation on assets with high CIA value and critical risks.
  2. Implement MFA and strict access controls for administrative panels.
  3. Ensure regular backup verification and encryption of sensitive data.
  4. Conduct bi-annual security audits to maintain the ${summary.complianceScore}% score.

───────────────────────────────────────────────────────────────
9. FINAL AUDIT OPINION
───────────────────────────────────────────────────────────────

OPINION: ${opinion.toUpperCase()}

Rationale: ${opinion === 'Secure'
                ? 'The organization maintains a strong cybersecurity posture with minimal high-level risks.'
                : opinion === 'Acceptable Risk'
                    ? 'The current risk level is manageable, but continuous monitoring is required.'
                    : 'Immediate remediation is required to address critical vulnerabilities and low compliance levels.'}

═══════════════════════════════════════════════════════════════
                        END OF REPORT
═══════════════════════════════════════════════════════════════
`
        // Download as text file
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-report-${project?.name?.replace(/\s+/g, '-') || 'project'}-${new Date().toISOString().slice(0, 10)}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Report downloaded')
    }

    if (isLoading) {
        return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    if (!reportData) {
        return (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Failed to load report data.</CardContent></Card>
        )
    }

    const { summary, opinion } = reportData

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Audit Report Generator
                    </CardTitle>
                    <CardDescription>Generate and download a comprehensive security audit report.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Report Preview Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <p className="text-3xl font-bold">{summary.totalRisks}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Risks</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <p className="text-3xl font-bold text-red-600">{summary.criticalRisks + summary.highRisks}</p>
                                <p className="text-xs text-muted-foreground mt-1">Critical + High</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <p className={`text-3xl font-bold ${summary.complianceScore >= 80 ? 'text-green-600' : summary.complianceScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {summary.complianceScore}%
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Compliance Score</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 text-center">
                                <p className="text-3xl font-bold">{summary.totalFindings}</p>
                                <p className="text-xs text-muted-foreground mt-1">Audit Findings</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-medium">Framework: {summary.framework}</p>
                            <p className="text-sm text-muted-foreground">{summary.totalControls} controls evaluated</p>
                        </div>
                        <Badge variant={summary.complianceScore >= 80 ? 'default' : 'destructive'}>
                            {summary.complianceScore >= 80 ? 'Passing' : 'Needs Improvement'}
                        </Badge>
                    </div>

                    <Button onClick={exportReport} className="w-full" size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        Download Full Report (.txt)
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
