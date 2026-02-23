"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ClipboardCheck, Shield, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AuditListPage() {
    const supabase = createClient() as any
    const [projects, setProjects] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadAudits = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('organization_id')
                    .eq('user_id', user.id)
                    .single()

                if (!profile) return

                // Fetch projects along with their audit checklists
                const { data: projectsData } = await supabase
                    .from('projects')
                    .select('*, audit_checklists(*, audit_items(compliance_status))')
                    .eq('organization_id', profile.organization_id)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                const projectsWithAuditInfo = (projectsData as any[] || []).map(p => {
                    const checklist = p.audit_checklists?.[0]
                    const items = checklist?.audit_items || []

                    const applicable = items.filter((i: any) => i.compliance_status !== 'not_applicable')
                    const compliant = items.filter((i: any) => i.compliance_status === 'compliant')
                    const partial = items.filter((i: any) => i.compliance_status === 'partially_compliant')

                    const score = applicable.length > 0
                        ? Math.round(((compliant.length + partial.length * 0.5) / applicable.length) * 100)
                        : 0

                    return {
                        ...p,
                        auditStatus: checklist?.status || 'not_started',
                        complianceScore: score,
                        totalItems: items.length
                    }
                })

                setProjects(projectsWithAuditInfo)
            } catch (error) {
                console.error('Error loading audits:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadAudits()
    }, [supabase.auth])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
            case 'in_progress': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>
            case 'not_started': return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" /> Not Started</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground animate-pulse">Loading Audit Module...</p>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Security Audit Management</h1>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm font-medium">Manage control checklists, verify evidence, and generate OCTAVE Allegro audit reports.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <Card className="bg-card">
                        <CardHeader className="pb-2 p-4 sm:p-6">
                            <CardDescription className="text-xs sm:text-sm">Average Compliance</CardDescription>
                            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">
                                {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.complianceScore, 0) / projects.length) : 0}%
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card">
                        <CardHeader className="pb-2 p-4 sm:p-6">
                            <CardDescription className="text-xs sm:text-sm">Ongoing Audits</CardDescription>
                            <CardTitle className="text-2xl sm:text-3xl font-bold">
                                {projects.filter(p => p.auditStatus === 'in_progress').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card">
                        <CardHeader className="pb-2 p-4 sm:p-6">
                            <CardDescription className="text-xs sm:text-sm">Completed Reports</CardDescription>
                            <CardTitle className="text-2xl sm:text-3xl font-bold">
                                {projects.filter(p => p.auditStatus === 'completed').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="border-none shadow-sm bg-card overflow-hidden">
                    <CardHeader className="border-b bg-muted/10 px-4 sm:px-6 py-4">
                        <CardTitle className="text-base sm:text-lg">Project Audit Inventory</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Overview of all security audits by project</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {projects.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <Shield className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                <p className="text-muted-foreground">No projects found. Create a project first to start an audit.</p>
                                <Link href="/projects/new" className="mt-4 inline-block">
                                    <Button variant="outline">New Project</Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Mobile List View */}
                                <div className="block sm:hidden divide-y">
                                    {projects.map((p) => (
                                        <div key={p.id} className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-sm">{p.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{p.industry || 'General Industry'}</p>
                                                </div>
                                                {getStatusBadge(p.auditStatus)}
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                    <span>Compliance</span>
                                                    <span>{p.complianceScore}%</span>
                                                </div>
                                                <Progress value={p.complianceScore} className="h-1.5" />
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>Updated {formatDate(p.updated_at)}</span>
                                                <Link href={`/audit/${p.id}`}>
                                                    <Button size="sm" className="h-7 text-[10px] px-2">
                                                        Manage Audit
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted/30 text-xs font-semibold uppercase text-muted-foreground border-b">
                                            <tr>
                                                <th className="px-6 py-4">Project Name</th>
                                                <th className="px-6 py-4">Audit Status</th>
                                                <th className="px-6 py-4">Compliance Score</th>
                                                <th className="px-6 py-4">Last Updated</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {projects.map((p) => (
                                                <tr key={p.id} className="hover:bg-muted/50 transition-colors group text-sm">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="font-semibold">{p.name}</p>
                                                        <p className="text-xs text-muted-foreground">{p.industry || 'General Industry'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(p.auditStatus)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Progress value={p.complianceScore} className="w-24 h-1.5" />
                                                            <span className="text-sm font-medium">{p.complianceScore}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                                        {formatDate(p.updated_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link href={`/audit/${p.id}`}>
                                                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                                                                <ClipboardCheck className="w-4 h-4 mr-1.5" />
                                                                Manage Audit
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
