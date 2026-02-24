"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AuditChecklist } from '@/components/audit/AuditChecklist'
import { AuditFindings } from '@/components/audit/AuditFindings'
import { ComplianceDashboard } from '@/components/audit/ComplianceDashboard'
import { AuditReport } from '@/components/audit/AuditReport'
import { AIAdvisor } from '@/components/audit/AIAdvisor'
import { EvidenceUpload } from '@/components/audit/EvidenceUpload'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types'

import { MainLayout } from '@/components/layout/MainLayout'

export default function AuditPage() {
    const auth = useAuth()
    const params = useParams()
    const router = useRouter()
    const supabase = createClient() as any
    const projectId = params.projectId as string

    const [project, setProject] = useState<Project | null>(null)
    const [profileId, setProfileId] = useState<string | null>(null)
    const [checklistId, setChecklistId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadPage()
    }, [projectId])

    const loadPage = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) { router.push('/auth/login'); return }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', authUser.id)
                .single()
            if (!profile) { toast.error('Profile not found'); return }
            setProfileId(profile.id)

            const { data: proj, error } = await supabase.from('projects').select('*').eq('id', projectId).single()
            if (error) { toast.error('Project not found'); router.push('/dashboard'); return }
            setProject(proj)

            // Load or create audit checklist
            const { data: existingChecklist } = await supabase
                .from('audit_checklists')
                .select('id')
                .eq('project_id', projectId)
                .single()

            if (existingChecklist) {
                setChecklistId(existingChecklist.id)
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to load audit page')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateChecklist = async (framework: string) => {
        if (!auth.isAuditor()) {
            toast.error('Unauthorized: Only Auditors can create audit checklists')
            return
        }
        try {
            const { data, error } = await supabase
                .from('audit_checklists')
                .insert({ project_id: projectId, framework })
                .select()
                .single()
            if (error) throw error

            // Auto-populate checklist items from framework
            const items = getFrameworkItems(framework)
            if (items.length > 0) {
                await supabase.from('audit_items').insert(
                    items.map(item => ({ checklist_id: data.id, ...item }))
                )
            }

            // Also inject checklist items triggered by vulnerabilities (Requirement 4.5)
            const { data: riskVulns } = await supabase
                .from('risk_vulnerability_mapping')
                .select('vulnerability_id, vulnerabilities(name, audit_checklist_item, category)')
                .in('risk_id', (await supabase.from('risks').select('id').eq('project_id', projectId)).data?.map((r: any) => r.id) || [])

            if (riskVulns && riskVulns.length > 0) {
                const vulnItems = riskVulns
                    .filter((rv: any) => rv.vulnerabilities?.audit_checklist_item)
                    .map((rv: any) => ({
                        checklist_id: data.id,
                        category: rv.vulnerabilities.category,
                        control_title: `[AUTO] Verify: ${rv.vulnerabilities.name}`,
                        control_description: rv.vulnerabilities.audit_checklist_item,
                        source: 'vulnerability_triggered',
                    }))

                // Deduplicate by control_title
                const unique = vulnItems.filter(
                    (item: any, idx: number, arr: any[]) => arr.findIndex((i: any) => i.control_title === item.control_title) === idx
                )
                if (unique.length > 0) {
                    await supabase.from('audit_items').insert(unique)
                }
            }

            setChecklistId(data.id)
            toast.success(`Audit checklist created with ${framework} framework`)
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || 'Failed to create checklist')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!project) return null

    const canEdit = auth.canEdit()

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate max-w-[280px] sm:max-w-none">{project.name}</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium flex items-center gap-2 flex-wrap">
                            <span>Audit & Compliance Assessment</span>
                            <span className="opacity-30 hidden sm:inline">•</span>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">OCTAVE Allegro</Badge>
                        </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 w-fit">
                        Active Audit
                    </Badge>
                </div>

                <Tabs defaultValue="checklist" className="space-y-6">
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="inline-flex w-full sm:grid sm:grid-cols-6 h-12 bg-muted/40 p-1 border shadow-sm min-w-[600px] sm:min-w-0">
                            <TabsTrigger value="checklist" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Checklist</TabsTrigger>
                            <TabsTrigger value="evidence" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Evidence</TabsTrigger>
                            <TabsTrigger value="compliance" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Compliance</TabsTrigger>
                            <TabsTrigger value="findings" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Findings</TabsTrigger>
                            <TabsTrigger value="ai" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">AI Advisor</TabsTrigger>
                            <TabsTrigger value="report" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Report</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ... Tab contents ... */}
                    <TabsContent value="checklist">
                        <AuditChecklist
                            projectId={projectId}
                            profileId={profileId!}
                            checklistId={checklistId}
                            onCreateChecklist={handleCreateChecklist}
                        />
                    </TabsContent>

                    <TabsContent value="evidence">
                        <EvidenceUpload
                            projectId={projectId}
                            checklistId={checklistId}
                            profileId={profileId}
                            canUpload={!auth.isAdmin()}
                        />
                    </TabsContent>

                    <TabsContent value="compliance">
                        <ComplianceDashboard projectId={projectId} checklistId={checklistId} />
                    </TabsContent>

                    <TabsContent value="findings">
                        <AuditFindings projectId={projectId} checklistId={checklistId} />
                    </TabsContent>

                    <TabsContent value="ai">
                        <AIAdvisor projectId={projectId} />
                    </TabsContent>

                    <TabsContent value="report">
                        <AuditReport projectId={projectId} checklistId={checklistId} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

// OCTAVE Allegro audit items (the selected framework)
function getFrameworkItems(framework: string) {
    const items: { category: string; control_title: string; control_description: string }[] = []

    items.push(
        { category: 'Risk Assessment', control_title: 'Asset Identification', control_description: 'Verify all critical information assets have been identified and profiled.' },
        { category: 'Risk Assessment', control_title: 'Threat Scenarios', control_description: 'Verify threat scenarios have been developed for each critical asset.' },
        { category: 'Risk Assessment', control_title: 'Risk Criteria', control_description: 'Verify risk measurement criteria are defined and documented.' },
        { category: 'Risk Assessment', control_title: 'Risk Analysis', control_description: 'Verify risks have been analyzed using the defined measurement criteria and impact areas.' },
        { category: 'Risk Assessment', control_title: 'Mitigation Approach', control_description: 'Verify mitigation strategy (accept, mitigate, transfer, avoid) has been selected for each identified risk.' },
        { category: 'Access Control', control_title: 'Access Control Policy', control_description: 'Verify role-based access control is implemented for all critical assets.' },
        { category: 'Access Control', control_title: 'Password Policy', control_description: 'Verify password management policy enforces complexity and rotation.' },
        { category: 'Access Control', control_title: 'User Provisioning', control_description: 'Verify formal user registration and de-registration process exists for granting and revoking access.' },
        { category: 'Physical Security', control_title: 'Physical Access Controls', control_description: 'Verify physical access to facilities and assets is controlled and monitored.' },
        { category: 'Physical Security', control_title: 'Environmental Protection', control_description: 'Verify environmental safeguards (fire suppression, UPS, cooling) are in place for critical assets.' },
        { category: 'Operations Security', control_title: 'Backup & Recovery', control_description: 'Verify backup procedures and disaster recovery plans exist and are tested regularly.' },
        { category: 'Operations Security', control_title: 'Change Management', control_description: 'Verify changes to systems are controlled through a formal change management process.' },
        { category: 'Operations Security', control_title: 'Logging & Monitoring', control_description: 'Verify event logs recording user activities, exceptions, and security events are maintained and reviewed.' },
        { category: 'Monitoring', control_title: 'Security Monitoring', control_description: 'Verify security events are logged and monitored for signs of compromise.' },
        { category: 'Monitoring', control_title: 'Vulnerability Detection', control_description: 'Verify vulnerability scanning is performed regularly on critical systems.' },
        { category: 'Incident Response', control_title: 'Incident Response Procedure', control_description: 'Verify incident response procedures are documented and personnel are trained.' },
        { category: 'Incident Response', control_title: 'Incident Communication', control_description: 'Verify communication channels and escalation procedures are defined for security incidents.' },
    )

    return items
}
