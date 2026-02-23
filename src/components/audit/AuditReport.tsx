"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { FileText, Download, Loader2, Printer, ShieldCheck, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { downloadReport } from '@/lib/pdf-generator'

interface AuditReportProps {
    projectId: string
    checklistId: string | null
}

export function AuditReport({ projectId, checklistId }: AuditReportProps) {
    const { role } = useAuth()
    const supabase = createClient() as any
    const [isLoading, setIsLoading] = useState(true)
    const [reportData, setReportData] = useState<any>(null)
    const [view, setView] = useState<'summary' | 'full'>('summary')

    useEffect(() => {
        loadReportData()
    }, [projectId, checklistId])

    const loadReportData = async () => {
        try {
            const [
                projectRes,
                risksRes,
                findingsRes,
                checklistRes,
                mitigationsRes,
                assetsRes,
                orgRes,
                criteriaRes,
                containersRes,
                concernsRes,
                scenariosRes,
                analysesRes
            ] = await Promise.all([
                supabase.from('projects').select('*').eq('id', projectId).single(),
                supabase.from('risks').select('*').eq('project_id', projectId).eq('is_active', true).order('risk_score', { ascending: false }),
                supabase.from('audit_findings').select('*').eq('project_id', projectId),
                checklistId
                    ? supabase.from('audit_checklists').select('*, audit_items(*)').eq('id', checklistId).single()
                    : Promise.resolve({ data: null }),
                supabase.from('mitigation_plans').select('*').eq('project_id', projectId),
                supabase.from('assets').select('*').eq('project_id', projectId).eq('is_active', true).order('name'),
                supabase.from('organizations').select('*').limit(1).single(),
                supabase.from('risk_measurement_criteria').select('*').eq('project_id', projectId).maybeSingle(),
                supabase.from('containers').select('*').eq('project_id', projectId).eq('is_active', true),
                supabase.from('concerns').select('*').eq('project_id', projectId).eq('is_active', true),
                supabase.from('threat_scenarios').select('*').eq('project_id', projectId).eq('is_active', true),
                supabase.from('risk_analysis').select('*').in('risk_id', (await supabase.from('risks').select('id').eq('project_id', projectId)).data?.map((r: any) => r.id) || []),
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
                allData: {
                    project: projectRes.data,
                    criteria: criteriaRes.data,
                    assets: assets,
                    containers: containersRes.data || [],
                    concerns: concernsRes.data || [],
                    threatScenarios: scenariosRes.data || [],
                    risks: risks,
                    analyses: analysesRes.data || [],
                    mitigationPlans: mitigations
                }
            })
        } catch (err) {
            toast.error('Failed to load report data')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePrint = async () => {
        if (!reportData) return

        try {
            await downloadReport(reportData.allData, `Risk_Shield_Report_${reportData.project.name}.pdf`)
            toast.success('Professional PDF generated successfully')
        } catch (err) {
            console.error(err)
            toast.error('Failed to generate professional PDF. Falling back to browser print.')
            window.print()
        }
    }

    const handleExportWord = () => {
        const content = document.getElementById('report-content')
        if (!content || !reportData) return

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Audit Report</title><style>body { font-family: 'Segoe UI', sans-serif; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccc; padding: 8px; }</style></head><body>";
        const footer = "</body></html>";
        const html = header + content.innerHTML + footer;

        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Audit_Report_${reportData.project?.name || 'Report'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleExportCSV = () => {
        if (!reportData?.findings || reportData.findings.length === 0) {
            toast.error('No findings to export')
            return
        }

        const headers = ['ID', 'Issue', 'Severity', 'Recommendation', 'Created At']
        const csvContent = [
            headers.join(','),
            ...reportData.findings.map((f: any) => [
                f.id,
                `"${f.issue.replace(/"/g, '""')}"`,
                f.severity,
                `"${f.recommendation?.replace(/"/g, '""') || ''}"`,
                f.created_at
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `Audit_Findings_${reportData.project?.name || 'Report'}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (isLoading) {
        return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    if (!reportData) {
        return <Card><CardContent className="py-12 text-center text-muted-foreground">Failed to load report data.</CardContent></Card>
    }

    const { summary, opinion, project, org, risks, findings, assets } = reportData

    // Porsi Role Logic
    const canSeeTechnicalGaps = role === 'admin' || role === 'auditor'
    const canSeeFindings = true

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print pt-2">
                <div className="flex gap-2">
                    <Button variant={view === 'summary' ? 'default' : 'outline'} onClick={() => setView('summary')} size="sm" className="font-bold">Summary View</Button>
                    <Button variant={view === 'full' ? 'default' : 'outline'} onClick={() => setView('full')} size="sm" className="font-bold">Full Preview</Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint} className="font-bold hover:bg-slate-50 border-2">
                        <Printer className="w-4 h-4 mr-2" />
                        PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportWord} className="font-bold hover:bg-slate-50 border-2">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Word
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="font-bold hover:bg-slate-50 border-2">
                        <Download className="w-4 h-4 mr-2 text-green-600" />
                        Excel/CSV
                    </Button>
                </div>
            </div>

            <div id="report-content" className="bg-white text-slate-900 border shadow-xl overflow-hidden print:shadow-none print:border-none">
                <div className="h-2 bg-primary" />
                <div className="p-8 md:p-12 space-y-10">
                    <div className="flex justify-between items-start border-b pb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                                <span className="font-black text-2xl tracking-tighter">Risk Shield System</span>
                            </div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Confidential Security Report</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium uppercase">Project Reference: {project?.id?.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="text-center py-6">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Security Audit & Risk Report</h1>
                        <p className="text-xl text-slate-500 font-medium">{project?.name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border flex flex-col items-center text-center">
                            <TrendingUp className="w-6 h-6 text-primary mb-2" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compliance</span>
                            <span className={`text-4xl font-black mt-1 ${summary.complianceScore >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                                {summary.complianceScore}%
                            </span>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border flex flex-col items-center text-center">
                            <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assessment</span>
                            <span className={`text-4xl font-black mt-1 ${opinion === 'Secure' ? 'text-green-600' : 'text-red-600'}`}>
                                {opinion}
                            </span>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border flex flex-col items-center text-center">
                            <CheckCircle2 className="w-6 h-6 text-blue-500 mb-2" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scope Assets</span>
                            <span className="text-4xl font-black mt-1 text-slate-900">{summary.totalAssets}</span>
                        </div>
                    </div>

                    {view === 'full' && (
                        <>
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">1. Executive Summary</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    The following report details the outcome of a comprehensive security review for <strong>{project?.name}</strong>.
                                    The assessment identified {summary.totalRisks} risks and {summary.totalFindings} specific audit findings that require organizational attention.
                                </p>
                            </section>

                            <section className="space-y-4 page-break">
                                <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">2. Asset Criticality Inventory</h2>
                                <div className="border rounded-xl h-fit">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="p-3 text-left font-bold border-b">Asset</th>
                                                <th className="p-3 text-left font-bold border-b">Type</th>
                                                <th className="p-3 text-center font-bold border-b">Criticality</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {assets.map((a: any) => (
                                                <tr key={a.id}>
                                                    <td className="p-3 font-medium">{a.name}</td>
                                                    <td className="p-3 text-slate-500">{a.type}</td>
                                                    <td className="p-3 text-center font-mono text-xs">{a.criticality_score}/10</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {canSeeTechnicalGaps && (
                                <section className="space-y-4 page-break">
                                    <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">3. Strategic Risk Assessment</h2>
                                    <div className="space-y-4">
                                        {risks.map((r: any) => (
                                            <div key={r.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-lg">{r.risk_title}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${r.risk_level === 'critical' ? 'bg-red-600 text-white' :
                                                        r.risk_level === 'high' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                                                        }`}>
                                                        {r.risk_level}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">{r.vulnerability_description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {canSeeFindings && (
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">4. Compliance Observations</h2>
                                    <div className="space-y-4">
                                        {findings.map((f: any) => (
                                            <div key={f.id} className="p-5 border-l-4 border-red-500 bg-red-50/30 rounded-r-xl">
                                                <h4 className="font-bold text-red-900 pb-2 border-b border-red-100 mb-2">{f.issue}</h4>
                                                <p className="text-sm text-slate-700 mt-2"><strong>Recommended Action:</strong> {f.recommendation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    <div className="pt-12 border-t mt-12 text-center text-[10px] text-slate-400 uppercase tracking-widest hidden print:block">
                        Proprietary & Confidential | Risk Shield System Report Security Data
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    header, footer, nav, aside, .no-print { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; left: 0 !important; position: static !important; }
                    body { background: white !important; font-size: 12pt; }
                    .page-break { page-break-before: always; }
                    .bg-slate-50 { background-color: #f8fafc !important; }
                }
            `}</style>
        </div>
    )
}
