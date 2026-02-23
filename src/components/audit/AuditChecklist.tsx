"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Shield, CheckCircle2, XCircle, AlertTriangle, MinusCircle } from 'lucide-react'

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
                        <Shield className="w-5 h-5" />
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
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
                    <h2 className="text-lg font-semibold">Audit Checklist</h2>
                    <p className="text-sm text-muted-foreground">{items.length} control items to review</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-green-50">{items.filter(i => i.compliance_status === 'compliant').length} Compliant</Badge>
                    <Badge variant="outline" className="bg-yellow-50">{items.filter(i => i.compliance_status === 'partially_compliant').length} Partial</Badge>
                    <Badge variant="outline" className="bg-red-50">{items.filter(i => i.compliance_status === 'non_compliant').length} Non-Compliant</Badge>
                </div>
            </div>

            {Object.entries(grouped).map(([category, catItems]) => (
                <Card key={category}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {catItems.map(item => {
                            const isExpanded = expandedItem === item.id
                            const statusInfo = statusConfig[item.compliance_status || 'not_applicable']
                            const StatusIcon = statusInfo.icon

                            return (
                                <div key={item.id} className="py-3">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <StatusIcon className={`w-5 h-5 ${item.compliance_status === 'compliant' ? 'text-green-600' : item.compliance_status === 'non_compliant' ? 'text-red-600' : item.compliance_status === 'partially_compliant' ? 'text-yellow-600' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.control_title}
                                                    {item.source === 'vulnerability_triggered' && (
                                                        <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700">Auto-generated</Badge>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-3 ml-8 space-y-3">
                                            <p className="text-sm text-muted-foreground">{item.control_description}</p>

                                            <div className="flex gap-2">
                                                {Object.entries(statusConfig).map(([key, cfg]) => (
                                                    <Button
                                                        key={key}
                                                        variant={item.compliance_status === key ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={savingItemId === item.id || !canEdit}
                                                        onClick={(e) => { e.stopPropagation(); updateItemStatus(item.id, key) }}
                                                    >
                                                        {cfg.label}
                                                    </Button>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-muted-foreground">Auditor Comments</label>
                                                <Textarea
                                                    defaultValue={item.auditor_comments || ''}
                                                    placeholder={canEdit ? "Add your audit notes here..." : "No notes available"}
                                                    className="mt-1"
                                                    onBlur={(e) => updateItemComments(item.id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    disabled={!canEdit}
                                                />
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
