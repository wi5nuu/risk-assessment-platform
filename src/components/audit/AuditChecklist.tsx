"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Shield, CheckCircle2, XCircle, AlertTriangle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react'

import { EvidenceUpload } from './EvidenceUpload'
import { useAuth } from '@/hooks/useAuth'

interface AuditChecklistProps {
    projectId: string
    profileId: string
    checklistId: string | null
    onCreateChecklist: (framework: string) => void
}

interface AuditItemRow {
    id: string
    checklist_id: string
    category: string | null
    control_title: string
    control_description: string | null
    compliance_status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable' | null
    auditor_comments: string | null
    source: string | null
}

const statusConfig = {
    compliant: { label: 'Compliant', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200' },
    partially_compliant: { label: 'Partial', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    non_compliant: { label: 'Non-Compliant', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' },
    not_applicable: { label: 'N/A', icon: MinusCircle, color: 'bg-gray-100 text-gray-500 border-gray-200' },
}

export function AuditChecklist({ projectId, profileId, checklistId, onCreateChecklist }: AuditChecklistProps) {
    const supabase = createClient() as any
    const [items, setItems] = useState<AuditItemRow[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const auth = useAuth()
    const canEdit = auth.canEdit()
    const isAuthLoading = auth.isLoading
    const [expandedItem, setExpandedItem] = useState<string | null>(null)
    const [savingItemId, setSavingItemId] = useState<string | null>(null)

    useEffect(() => {
        if (checklistId) loadItems()
    }, [checklistId])

    const loadItems = async () => {
        if (!checklistId) return
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('audit_items')
                .select('*')
                .eq('checklist_id', checklistId)
                .order('category', { ascending: true })
            if (error) throw error
            setItems(data || [])
        } catch (err) {
            toast.error('Failed to load checklist items')
        } finally {
            setIsLoading(false)
        }
    }

    const updateItemStatus = async (itemId: string, status: string) => {
        if (!canEdit) {
            toast.error('Unauthorized: Only Admins and Auditors can update compliance status')
            return
        }
        setSavingItemId(itemId)
        try {
            const { error } = await supabase
                .from('audit_items')
                .update({ compliance_status: status })
                .eq('id', itemId)
            if (error) throw error
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, compliance_status: status as any } : i))
            toast.success('Status updated')
        } catch (err) {
            toast.error('Failed to update status')
        } finally {
            setSavingItemId(null)
        }
    }

    const updateItemComments = async (itemId: string, comments: string) => {
        if (!auth.isAuditor()) {
            toast.error('Unauthorized: Only Auditors can update auditor comments')
            return
        }
        try {
            const { error } = await supabase
                .from('audit_items')
                .update({ auditor_comments: comments })
                .eq('id', itemId)
            if (error) throw error
        } catch (err) {
            toast.error('Failed to save comment')
        }
    }

    // No checklist yet — show OCTAVE Allegro info
    if (!checklistId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        OCTAVE Allegro Security Audit
                    </CardTitle>
                    <CardDescription>
                        Generate an audit checklist based on the OCTAVE Allegro risk assessment methodology. Controls triggered by detected vulnerabilities will be added automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card className="border-primary ring-2 ring-primary/20">
                        <CardContent className="p-4">
                            <h3 className="font-semibold">OCTAVE Allegro</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Risk-centric analysis methodology focused on critical information assets, threat scenarios, and organizational risk measurement criteria.
                            </p>
                            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc ml-4">
                                <li>Step 1-3: Establish Risk Measurement Criteria</li>
                                <li>Step 4: Develop Information Asset Profiles</li>
                                <li>Step 5: Identify Threat Scenarios</li>
                                <li>Step 6: Identify Risks</li>
                                <li>Step 7: Analyze Risks</li>
                                <li>Step 8: Select Mitigation Approach</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Button
                        className="w-full"
                        onClick={() => onCreateChecklist('OCTAVE Allegro')}
                        disabled={!canEdit}
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        {canEdit ? 'Generate OCTAVE Allegro Audit Checklist' : 'Waiting for Auditor to Start'}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (isLoading || isAuthLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Verifying permissions...</p>
            </div>
        )
    }

    // Group items by category
    const grouped: Record<string, AuditItemRow[]> = {}
    items.forEach(item => {
        const cat = item.category || 'General'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(item)
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Audit Checklist</h2>
                    <p className="text-sm text-muted-foreground">{items.length} control items to review</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-green-50 text-green-700">{items.filter(i => i.compliance_status === 'compliant').length} Compliant</Badge>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">{items.filter(i => i.compliance_status === 'partially_compliant').length} Partial</Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700">{items.filter(i => i.compliance_status === 'non_compliant').length} Non-Compliant</Badge>
                </div>
            </div>

            {Object.entries(grouped).map(([category, catItems]) => (
                <Card key={category} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2 bg-muted/30">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            {category}
                            <Badge variant="secondary" className="font-normal">{catItems.length} items</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y p-0">
                        {catItems.map(item => {
                            const isExpanded = expandedItem === item.id
                            const statusInfo = statusConfig[item.compliance_status || 'not_applicable']
                            const StatusIcon = statusInfo.icon

                            return (
                                <div key={item.id} className="transition-all duration-200">
                                    <div
                                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${isExpanded ? 'bg-muted/50' : ''}`}
                                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-1.5 rounded-full ${item.compliance_status === 'compliant' ? 'bg-green-100 text-green-600' : item.compliance_status === 'non_compliant' ? 'bg-red-100 text-red-600' : item.compliance_status === 'partially_compliant' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <StatusIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {item.control_title}
                                                    {item.source === 'vulnerability_triggered' && (
                                                        <Badge variant="outline" className="ml-2 text-[10px] uppercase bg-purple-50 text-purple-700 border-purple-200">Auto-generated</Badge>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${statusInfo.color} font-medium border shadow-sm`}>{statusInfo.label}</Badge>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-6 bg-background border-t space-y-6">
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h4>
                                                <p className="text-sm leading-relaxed">{item.control_description}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Set Compliance Status</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(statusConfig).map(([key, cfg]) => (
                                                        <Button
                                                            key={key}
                                                            variant={item.compliance_status === key ? 'default' : 'outline'}
                                                            size="sm"
                                                            disabled={savingItemId === item.id || !canEdit}
                                                            onClick={(e) => { e.stopPropagation(); updateItemStatus(item.id, key) }}
                                                            className={`h-9 ${item.compliance_status === key ? 'shadow-md border-primary/50' : ''}`}
                                                        >
                                                            <cfg.icon className="w-4 h-4 mr-2" />
                                                            {cfg.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3 p-4 rounded-lg bg-muted/10 border border-muted-foreground/10">
                                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                                                        <Shield className="w-4 h-4" />
                                                        Evidence Files
                                                    </h4>
                                                    <EvidenceUpload
                                                        projectId={projectId}
                                                        checklistId={checklistId}
                                                        itemId={item.id}
                                                        profileId={profileId}
                                                        canUpload={true}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                                        Auditor Comments
                                                    </h4>
                                                    <Textarea
                                                        defaultValue={item.auditor_comments || ''}
                                                        placeholder={auth.isAuditor() ? "Add your observations, gaps, or recommendations..." : "Only Auditors can add comments"}
                                                        className="min-h-[140px] bg-muted/20 focus:bg-background transition-colors outline-none ring-0 focus:ring-1 focus:ring-primary/20"
                                                        onBlur={(e) => updateItemComments(item.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={!auth.isAuditor()}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
