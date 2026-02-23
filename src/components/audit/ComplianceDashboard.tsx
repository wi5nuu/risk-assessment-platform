"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, BarChart3, CheckCircle2, XCircle, AlertTriangle, MinusCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ComplianceDashboardProps {
    projectId: string
    checklistId: string | null
}

interface Stats {
    total: number
    compliant: number
    partial: number
    nonCompliant: number
    na: number
    unreviewed: number
    score: number
}

interface CategoryStat {
    category: string
    compliant: number
    partial: number
    nonCompliant: number
    na: number
    total: number
    score: number
}

export function ComplianceDashboard({ projectId, checklistId }: ComplianceDashboardProps) {
    const supabase = createClient() as any
    const [stats, setStats] = useState<Stats>({ total: 0, compliant: 0, partial: 0, nonCompliant: 0, na: 0, unreviewed: 0, score: 0 })
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (checklistId) loadStats()
        else setIsLoading(false)
    }, [checklistId])

    const loadStats = async () => {
        try {
            const { data, error } = await supabase
                .from('audit_items')
                .select('*')
                .eq('checklist_id', checklistId)
            if (error) throw error

            const items = data || []
            const total = items.length
            const compliant = items.filter((i: any) => i.compliance_status === 'compliant').length
            const partial = items.filter((i: any) => i.compliance_status === 'partially_compliant').length
            const nonCompliant = items.filter((i: any) => i.compliance_status === 'non_compliant').length
            const na = items.filter((i: any) => i.compliance_status === 'not_applicable').length
            const unreviewed = items.filter((i: any) => !i.compliance_status).length

            // Compliance score formula: (compliant * 1 + partial * 0.5) / (total - na) * 100
            const applicable = total - na
            const score = applicable > 0 ? Math.round(((compliant + partial * 0.5) / applicable) * 100) : 0

            setStats({ total, compliant, partial, nonCompliant, na, unreviewed, score })

            // Calculate per-category stats
            const cats = new Map<string, any[]>()
            items.forEach((item: any) => {
                const cat = item.category || 'General'
                if (!cats.has(cat)) cats.set(cat, [])
                cats.get(cat)!.push(item)
            })

            const catStats: CategoryStat[] = []
            cats.forEach((catItems, category) => {
                const catTotal = catItems.length
                const catCompliant = catItems.filter(i => i.compliance_status === 'compliant').length
                const catPartial = catItems.filter(i => i.compliance_status === 'partially_compliant').length
                const catNonCompliant = catItems.filter(i => i.compliance_status === 'non_compliant').length
                const catNa = catItems.filter(i => i.compliance_status === 'not_applicable').length
                const catApplicable = catTotal - catNa
                const catScore = catApplicable > 0 ? Math.round(((catCompliant + catPartial * 0.5) / catApplicable) * 100) : 0
                catStats.push({ category, compliant: catCompliant, partial: catPartial, nonCompliant: catNonCompliant, na: catNa, total: catTotal, score: catScore })
            })
            setCategoryStats(catStats.sort((a, b) => a.score - b.score))

            // Save compliance score to checklist
            await supabase
                .from('audit_checklists')
                .update({ compliance_score: score })
                .eq('id', checklistId)

        } catch (err) {
            toast.error('Failed to load compliance data')
        } finally {
            setIsLoading(false)
        }
    }

    if (!checklistId) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    Create an audit checklist first to view compliance scoring.
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getProgressColor = (score: number) => {
        if (score >= 80) return '[&>div]:bg-green-500'
        if (score >= 50) return '[&>div]:bg-yellow-500'
        return '[&>div]:bg-red-500'
    }

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overall Compliance Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <span className={`text-5xl font-bold ${getScoreColor(stats.score)}`}>{stats.score}%</span>
                            <span className="text-muted-foreground mb-1">of applicable controls</span>
                        </div>
                        <Progress value={stats.score} className={`mt-3 h-3 ${getProgressColor(stats.score)}`} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Reviewed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{stats.total - stats.unreviewed}</span>
                        <span className="text-muted-foreground"> / {stats.total}</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> {stats.compliant} Compliant</div>
                        <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600" /> {stats.partial} Partial</div>
                        <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-600" /> {stats.nonCompliant} Non-Compliant</div>
                        <div className="flex items-center gap-2"><MinusCircle className="w-4 h-4 text-gray-400" /> {stats.na} N/A</div>
                    </CardContent>
                </Card>
            </div>

            {/* Per-Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Compliance by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {categoryStats.map(cat => (
                        <div key={cat.category}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{cat.category}</span>
                                <span className={`text-sm font-bold ${getScoreColor(cat.score)}`}>{cat.score}%</span>
                            </div>
                            <div className="flex gap-1 h-4 rounded-md overflow-hidden">
                                {cat.compliant > 0 && <div className="bg-green-500" style={{ width: `${(cat.compliant / cat.total) * 100}%` }} />}
                                {cat.partial > 0 && <div className="bg-yellow-400" style={{ width: `${(cat.partial / cat.total) * 100}%` }} />}
                                {cat.nonCompliant > 0 && <div className="bg-red-500" style={{ width: `${(cat.nonCompliant / cat.total) * 100}%` }} />}
                                {cat.na > 0 && <div className="bg-gray-200" style={{ width: `${(cat.na / cat.total) * 100}%` }} />}
                                {(cat.total - cat.compliant - cat.partial - cat.nonCompliant - cat.na) > 0 && (
                                    <div className="bg-gray-100" style={{ width: `${((cat.total - cat.compliant - cat.partial - cat.nonCompliant - cat.na) / cat.total) * 100}%` }} />
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
