"use client"

import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, FileText, Trash2, Loader2, Download, Paperclip } from 'lucide-react'

interface EvidenceUploadProps {
    checklistId: string | null
    itemId?: string
    projectId: string
    canUpload: boolean // Both auditor and auditee can upload
}

interface EvidenceRow {
    id: string
    item_id: string | null
    file_name: string
    file_path: string
    file_size: number
    uploaded_by: string | null
    created_at: string
}

export function EvidenceUpload({ checklistId, itemId, projectId, canUpload }: EvidenceUploadProps) {
    const supabase = createClient() as any
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [evidence, setEvidence] = useState<EvidenceRow[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (checklistId) loadEvidence()
    }, [checklistId, itemId])

    const loadEvidence = async () => {
        setIsLoading(true)
        try {
            let query = supabase.from('audit_evidence').select('*')
            if (itemId) {
                query = query.eq('item_id', itemId)
            } else if (checklistId) {
                // Get all evidence for this checklist via items
                const { data: items } = await supabase
                    .from('audit_items')
                    .select('id')
                    .eq('checklist_id', checklistId)
                const itemIds = items?.map((i: any) => i.id) || []
                if (itemIds.length > 0) {
                    query = query.in('item_id', itemIds)
                } else {
                    setEvidence([])
                    setIsLoading(false)
                    return
                }
            }
            const { data, error } = await query.order('created_at', { ascending: false })
            if (error) throw error
            setEvidence(data || [])
        } catch (err) {
            console.error('Failed to load evidence:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!itemId && !checklistId) {
            toast.error('No checklist or item selected')
            return
        }

        setIsUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const filePath = `${projectId}/${checklistId}/${Date.now()}_${file.name}`

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('audit-evidence')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Save metadata to audit_evidence table
            const { error: dbError } = await supabase
                .from('audit_evidence')
                .insert({
                    item_id: itemId || null,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    uploaded_by: user?.id || null,
                })

            if (dbError) throw dbError

            toast.success('Evidence uploaded successfully')
            loadEvidence()
        } catch (err: any) {
            console.error('Upload error:', err)
            toast.error(err.message || 'Failed to upload evidence')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDownload = async (ev: EvidenceRow) => {
        try {
            const { data, error } = await supabase.storage
                .from('audit-evidence')
                .download(ev.file_path)

            if (error) throw error

            const url = URL.createObjectURL(data)
            const a = document.createElement('a')
            a.href = url
            a.download = ev.file_name
            a.click()
            URL.revokeObjectURL(url)
        } catch (err: any) {
            toast.error('Failed to download: ' + err.message)
        }
    }

    const handleDelete = async (ev: EvidenceRow) => {
        try {
            await supabase.storage.from('audit-evidence').remove([ev.file_path])
            await supabase.from('audit_evidence').delete().eq('id', ev.id)
            setEvidence(prev => prev.filter(e => e.id !== ev.id))
            toast.success('Evidence deleted')
        } catch (err: any) {
            toast.error('Failed to delete: ' + err.message)
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Evidence / Attachments
                </CardTitle>
                <CardDescription className="text-xs">
                    Upload documents, screenshots, or other evidence to support audit findings
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {canUpload && (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                        />
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                            ) : (
                                <><Upload className="w-4 h-4 mr-2" /> Upload Evidence</>
                            )}
                        </Button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                ) : evidence.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">No evidence uploaded yet</p>
                ) : (
                    <div className="space-y-2">
                        {evidence.map(ev => (
                            <div key={ev.id} className="flex items-center justify-between p-2 border rounded-lg">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{ev.file_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatSize(ev.file_size)} • {new Date(ev.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(ev)}>
                                        <Download className="w-3.5 h-3.5" />
                                    </Button>
                                    {canUpload && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(ev)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
