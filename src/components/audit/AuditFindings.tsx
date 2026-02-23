"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { AlertTriangle, Loader2, Plus, Wand2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AuditFindingsProps {
    projectId: string
    checklistId: string | null
}

interface FindingRow {
    id: string
    project_id: string
    audit_item_id: string
    issue: string
    risk_description: string
    affected_asset_id: string | null
    recommendation: string | null
    severity: 'low' | 'medium' | 'high' | 'critical' | null
    created_at: string
    audit_item?: { control_title: string } | null
    affected_asset?: { name: string } | null
}

const severityConfig: Record<string, { label: string; color: string }> = {
    critical: { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    low: { label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-300' },
}

export function AuditFindings({ projectId, checklistId }: AuditFindingsProps) {
    const supabase = createClient() as any
    const auth = useAuth()
    const canEdit = auth.canEdit()
    const [findings, setFindings] = useState<FindingRow[]>([])
    const [auditItems, setAuditItems] = useState<any[]>([])
    const [assets, setAssets] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [formData, setFormData] = useState({
        audit_item_id: '',
        issue: '',
        risk_description: '',
        affected_asset_id: '',
        recommendation: '',
        severity: 'medium',
    })

    useEffect(() => {
        loadData()
    }, [projectId, checklistId])

    const loadData = async () => {
        try {
            const [findingsRes, assetsRes] = await Promise.all([
                supabase
                    .from('audit_findings')
                    .select('*, audit_items:audit_item_id(control_title)')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('assets')
                    .select('id, name')
                    .eq('project_id', projectId)
                    .eq('is_active', true),
            ])

            if (findingsRes.error) throw findingsRes.error
            setFindings(findingsRes.data || [])
            setAssets(assetsRes.data || [])

            if (checklistId) {
                const { data: items } = await supabase
                    .from('audit_items')
                    .select('id, control_title')
                    .eq('checklist_id', checklistId)
                setAuditItems(items || [])
            }
        } catch (err) {
            toast.error('Failed to load findings')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('audit_findings').insert({
                project_id: projectId,
                audit_item_id: formData.audit_item_id,
                issue: formData.issue,
                risk_description: formData.risk_description,
                affected_asset_id: formData.affected_asset_id || null,
                recommendation: formData.recommendation || null,
                severity: formData.severity,
            })
            if (error) throw error
            toast.success('Finding recorded')
            setIsDialogOpen(false)
            setFormData({ audit_item_id: '', issue: '', risk_description: '', affected_asset_id: '', recommendation: '', severity: 'medium' })
            loadData()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save finding')
        }
    }

    const autoGenerateFindings = async () => {
        if (!checklistId) { toast.error('Create a checklist first'); return }
        setIsGenerating(true)
        try {
            // Get non-compliant and partially compliant items
            const { data: failedItems, error } = await supabase
                .from('audit_items')
                .select('id, control_title, control_description, compliance_status, category')
                .eq('checklist_id', checklistId)
                .in('compliance_status', ['non_compliant', 'partially_compliant'])

            if (error) throw error
            if (!failedItems || failedItems.length === 0) {
                toast.info('No non-compliant items found — nothing to generate')
                setIsGenerating(false)
                return
            }

            // Check which items already have findings
            const { data: existingFindings } = await supabase
                .from('audit_findings')
                .select('audit_item_id')
                .eq('project_id', projectId)

            const existingItemIds = new Set(existingFindings?.map((f: any) => f.audit_item_id) || [])
            const newItems = failedItems.filter((item: any) => !existingItemIds.has(item.id))

            if (newItems.length === 0) {
                toast.info('Findings already exist for all non-compliant items')
                setIsGenerating(false)
                return
            }

            const newFindings = newItems.map((item: any) => ({
                project_id: projectId,
                audit_item_id: item.id,
                issue: `${item.compliance_status === 'non_compliant' ? 'Non-compliant' : 'Partially compliant'}: ${item.control_title}`,
                risk_description: `The control "${item.control_title}" (${item.category}) is ${item.compliance_status === 'non_compliant' ? 'not implemented' : 'only partially implemented'}. ${item.control_description || ''}`,
                recommendation: `Implement controls to address: ${item.control_title}. Ensure full compliance with ${item.category} requirements.`,
                severity: item.compliance_status === 'non_compliant' ? 'high' : 'medium',
            }))

            const { error: insertError } = await supabase.from('audit_findings').insert(newFindings)
            if (insertError) throw insertError

            toast.success(`Generated ${newFindings.length} findings from non-compliant controls`)
            loadData()
        } catch (err: any) {
            toast.error(err.message || 'Failed to generate findings')
        } finally {
            setIsGenerating(false)
        }
    }

    if (isLoading) {
        return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Audit Findings</h2>
                    <p className="text-sm text-muted-foreground">{findings.length} finding(s) recorded</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={autoGenerateFindings}
                        disabled={isGenerating || !checklistId || !canEdit}
                    >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Auto-Generate'}
                    </Button>
                    {canEdit && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="w-4 h-4 mr-2" /> Add Finding</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>New Audit Finding</DialogTitle></DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label>Related Audit Control</Label>
                                        <Select value={formData.audit_item_id} onValueChange={v => setFormData(f => ({ ...f, audit_item_id: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Select control..." /></SelectTrigger>
                                            <SelectContent>
                                                {auditItems.map(item => (
                                                    <SelectItem key={item.id} value={item.id}>{item.control_title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Issue *</Label>
                                        <Input value={formData.issue} onChange={e => setFormData(f => ({ ...f, issue: e.target.value }))} required />
                                    </div>
                                    <div>
                                        <Label>Risk Description *</Label>
                                        <Textarea value={formData.risk_description} onChange={e => setFormData(f => ({ ...f, risk_description: e.target.value }))} required />
                                    </div>
                                    <div>
                                        <Label>Affected Asset</Label>
                                        <Select value={formData.affected_asset_id} onValueChange={v => setFormData(f => ({ ...f, affected_asset_id: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Select asset..." /></SelectTrigger>
                                            <SelectContent>
                                                {assets.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Severity</Label>
                                        <Select value={formData.severity} onValueChange={v => setFormData(f => ({ ...f, severity: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Recommendation</Label>
                                        <Textarea value={formData.recommendation} onChange={e => setFormData(f => ({ ...f, recommendation: e.target.value }))} />
                                    </div>
                                    <Button type="submit" className="w-full">Save Finding</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {findings.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No findings yet. Use "Auto-Generate" to create findings from non-compliant audit items.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {findings.map(finding => (
                        <Card key={finding.id}>
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={severityConfig[finding.severity || 'medium'].color}>
                                                {severityConfig[finding.severity || 'medium'].label}
                                            </Badge>
                                            <h3 className="font-medium text-sm">{finding.issue}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{finding.risk_description}</p>
                                        {finding.recommendation && (
                                            <p className="text-sm mt-2"><span className="font-medium">Recommendation:</span> {finding.recommendation}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
