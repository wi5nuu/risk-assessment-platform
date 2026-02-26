"use client"

import React, { useState, useRef, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Book, FileText, Download, Shield, LayoutDashboard, Database, ClipboardCheck, PlayCircle, Upload, Loader2, Trash2, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { jsPDF } from 'jspdf'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface Tutorial {
    id: string
    title: string
    description: string
    file_path: string
    file_type: string
    role_target: string
    created_at: string
}

export default function GuidePage() {
    const auth = useAuth()
    const supabase = createClient() as any
    const [isGenerating, setIsGenerating] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [tutorials, setTutorials] = useState<Tutorial[]>([])
    const [isLoadingTutorials, setIsLoadingTutorials] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const role = auth.role?.toLowerCase() || 'auditee'

    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        role_target: 'all'
    })

    useEffect(() => {
        loadTutorials()
    }, [role])

    const loadTutorials = async () => {
        setIsLoadingTutorials(true)
        try {
            // Filter by role or show 'all'
            const { data, error } = await supabase
                .from('tutorials')
                .select('*')
                .or(`role_target.eq.all,role_target.eq.${role}`)
                .order('created_at', { ascending: false })

            if (error) {
                // Ignore error if table doesn't exist yet (first time)
                console.log('Tutorials table might not exist yet')
            } else {
                setTutorials(data || [])
            }
        } catch (err) {
            console.error('Error loading tutorials:', err)
        } finally {
            setIsLoadingTutorials(false)
        }
    }

    const generatePDF = () => {
        setIsGenerating(true)
        const doc = new jsPDF()
        const userName = `${auth.firstName} ${auth.lastName}`
        const userEmail = auth.email

        // Add header
        doc.setFontSize(22)
        doc.setTextColor(15, 23, 42)
        doc.text("RISK SHIELD SYSTEM", 105, 20, { align: 'center' })

        doc.setFontSize(16)
        doc.text(`Official User Manual - ${role.toUpperCase()} Edition`, 105, 30, { align: 'center' })

        doc.setFontSize(9)
        doc.setTextColor(100, 116, 139)
        doc.text(`Document Version: 1.0.0-Stable`, 105, 36, { align: 'center' })
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 41, { align: 'center' })

        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.5)
        doc.line(20, 45, 190, 45)

        // Professional Metadata Section
        doc.setFontSize(10)
        doc.setTextColor(15, 23, 42)
        doc.setFont("helvetica", "bold")
        doc.text("AUTHORIZED DOCUMENTATION", 20, 55)

        doc.setFont("helvetica", "normal")
        doc.text(`Prepared By: ${userName}`, 20, 62)
        doc.text(`Author Email: ${userEmail}`, 20, 67)
        doc.text(`Website: https://www.riskshieldsystem.my.id/`, 20, 72)
        doc.text(`Organization: ${auth.organizationName || 'Risk Shield Platform'}`, 190, 62, { align: 'right' })
        doc.text(`Security Role: ${role.toUpperCase()}`, 190, 67, { align: 'right' })
        doc.text(`System ID: RS-GEN-2026`, 190, 72, { align: 'right' })

        doc.line(20, 77, 190, 77)

        // Content generation based on role
        let y = 87
        const sections = getSections(role)

        sections.forEach(section => {
            // Check for new page
            const lines = doc.splitTextToSize(section.content, 170)
            const requiredSpace = (lines.length * 5) + 20

            if (y + requiredSpace > 280) {
                doc.addPage()
                y = 20
            }

            doc.setFontSize(13)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(15, 23, 42)
            doc.text(section.title, 20, y)
            y += 7

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(71, 85, 105)
            doc.text(lines, 20, y)
            y += (lines.length * 5) + 12
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(148, 163, 184)
            doc.text(`© 2026 Risk Shield System. Confidential Authorization Required. Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
        }

        doc.save(`RiskShield_Manual_${role}.pdf`)
        setIsGenerating(false)
        toast.success('Professional manual generated successfully!')
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        const file = fileInputRef.current?.files?.[0]
        if (!file) {
            toast.error('Please select a file to upload')
            return
        }

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${uuidv4()}.${fileExt}`
            const filePath = `tutorials/${fileName}`

            // 1. Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('tutorials')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Insert into database
            const { error: dbError } = await supabase
                .from('tutorials')
                .insert({
                    title: uploadData.title,
                    description: uploadData.description,
                    file_path: filePath,
                    file_type: fileExt,
                    role_target: uploadData.role_target,
                    uploaded_by: auth.profileId
                })

            if (dbError) throw dbError

            toast.success('Tutorial uploaded successfully')
            setIsUploadOpen(false)
            setUploadData({ title: '', description: '', role_target: 'all' })
            loadTutorials()
        } catch (err: any) {
            console.error('Upload error:', err)
            toast.error(err.message || 'Failed to upload tutorial. Make sure the "tutorials" storage bucket exists.')
        } finally {
            setIsUploading(false)
        }
    }

    const downloadTutorial = async (tut: Tutorial) => {
        try {
            const { data, error } = await supabase.storage
                .from('tutorials')
                .download(tut.file_path)

            if (error) throw error

            const url = URL.createObjectURL(data)
            const a = document.createElement('a')
            a.href = url
            a.download = `${tut.title}.${tut.file_type}`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err: any) {
            toast.error('Download failed: ' + err.message)
        }
    }

    const deleteTutorial = async (tut: Tutorial) => {
        if (!confirm('Are you sure you want to delete this tutorial?')) return
        try {
            await supabase.storage.from('tutorials').remove([tut.file_path])
            await supabase.from('tutorials').delete().eq('id', tut.id)
            loadTutorials()
            toast.success('Tutorial deleted')
        } catch (err: any) {
            toast.error('Delete failed: ' + err.message)
        }
    }

    const getSections = (r: string) => {
        const common = [
            { title: "Introduction to Risk Shield", content: "Risk Shield System is an integrated GRC (Governance, Risk, and Compliance) platform. It helps organizations automate cybersecurity risk analysis based on the OCTAVE Allegro methodology. Designed for security teams, it bridges the gap between technical vulnerabilities and business impact." },
            { title: "System Navigation & UI", content: "Our NASA-inspired dashboard provides real-time visibility. The Sidebar allows access to core modules like Dashboard, Project Wizard, Audit Center, and AI Advisor. The Intelligence Stream at the top provides real-time security alerts and system telemetry." },
            { title: "Support & Admin Hub", content: "For technical support, account management, or reporting unauthorized access, please visit the official Support portal at https://www.riskshieldsystem.my.id/support or contact your designated System Administrator directly. High-priority security concerns should be reported via the Admin Hub available in the dashboard settings." }
        ]

        const auditee = [
            ...common,
            { title: "Dashboard for Auditees", content: "As an Auditee, your primary focus is on assigned security projects. The dashboard summarizes current risk assessments and critical alerts relevant to your department or organizational unit." },
            { title: "Step-by-Step Tutorial: Uploading Evidence", content: "1. Navigate to 'Security Audit' in the sidebar.\n2. Select the currently active project from the list.\n3. Click on the 'Evidence' tab to view required documentation.\n4. Click 'Upload Evidence' next to the specific control item requested by the Auditor.\n5. Select your file (PDF, JPG, or DOCX) and click Save. Your proof will be instantly available for Auditor verification." },
            { title: "Security Awareness", content: "Your participation is vital for the 'Verify Controls' phase of OCTAVE Allegro. Ensure that all uploaded evidence is accurate and reflects current operational practices." }
        ]

        const auditor = [
            ...common,
            { title: "Step-by-Step Tutorial: Risk Assessment", content: "1. Open the 'Projects' page and click 'New Assessment'.\n2. You will be directed to the Risk Wizard.\n3. Complete the 8-step OCTAVE Allegro roadmap, from establishing impact criteria to selecting mitigation strategies.\n4. Upon completion, navigate to the 'Security Audit' module to begin control verification." },
            { title: "Step-by-Step Tutorial: Audit Verification", content: "1. Open 'Security Audit' and select your project.\n2. In the 'Checklist' tab, review the proof provided by the Auditee.\n3. Determine the compliance status (Compliant, Non-Compliant, or Partial).\n4. If gaps are identified, go to the 'Findings' tab and click 'Auto-Generate' to let the AI engine draft technical security findings based on detected non-compliance." },
            { title: "Audit & Compliance Management", content: "Maintain neutrality during control evaluation. Use the AI Advisor to bridge the gap between technical findings and management-level reporting." }
        ]

        const admin = [
            ...auditor,
            { title: "Step-by-Step Tutorial: System Oversight", content: "1. Access 'Admin Control' to monitor global system integrity and telemetry.\n2. To onboard new users, navigate to the 'User Management' tab and create credentials with assigned roles.\n3. To generate official academic or management reports, go to the 'Projects' page, select a completed assessment, and click 'Generate Admin Report' for identity-verified PDF export." },
            { title: "Administrator Governance", content: "Administrators are responsible for maintaining the RBAC matrix and ensuring the platform's availability. Monitor the Intelligence Stream for any unauthorized access patterns or system updates." }
        ]

        if (r === 'admin') return admin
        if (r === 'auditor') return auditor
        return auditee
    }

    const currentSections = getSections(role)

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Book className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Smart User Manual</h1>
                        </div>
                        <p className="text-muted-foreground">Comprehensive system guide tailored for your <span className="text-primary font-bold uppercase">{role}</span> role.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            size="lg"
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="flex-1 md:flex-none shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all bg-slate-900 border-none group"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 group-hover:translate-y-1 transition-transform" />}
                            Generate Role Manual (PDF)
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Interactive Roadmap */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="border-none shadow-xl bg-card">
                            <CardHeader className="border-b bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-primary" />
                                        Interactive Learning Roadmap
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-background">{currentSections.length} Sections</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Accordion type="single" collapsible className="w-full">
                                    {currentSections.map((section, idx) => (
                                        <AccordionItem value={`item-${idx}`} key={idx} className="border-b px-6 hover:bg-muted/30 transition-colors last:border-b-0">
                                            <AccordionTrigger className="text-left py-5 hover:no-underline">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="font-bold text-slate-800">{section.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-6 pl-12 text-sm sm:text-base">
                                                {section.content}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Tutorial Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5 text-red-600" />
                                    External Tutorial Library
                                </h3>
                                {auth.isAdmin() && (
                                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5">
                                                <Upload className="w-4 h-4 mr-2" />
                                                Add Tutorial
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Upload New Tutorial</DialogTitle></DialogHeader>
                                            <form onSubmit={handleUpload} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Tutorial Title</Label>
                                                    <Input
                                                        value={uploadData.title}
                                                        onChange={e => setUploadData(d => ({ ...d, title: e.target.value }))}
                                                        placeholder="e.g., Risk Shield Video Guide"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        value={uploadData.description}
                                                        onChange={e => setUploadData(d => ({ ...d, description: e.target.value }))}
                                                        placeholder="Short summary of the tutorial content..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Target Audience</Label>
                                                    <Select value={uploadData.role_target} onValueChange={v => setUploadData(d => ({ ...d, role_target: v }))}>
                                                        <option value="all">All Roles</option>
                                                        <option value="admin">Admin Only</option>
                                                        <option value="auditor">Auditor Only</option>
                                                        <option value="auditee">Auditee Only</option>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Select File</Label>
                                                    <Input ref={fileInputRef} type="file" accept=".pdf,.docx,.mp4" required />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={isUploading}>
                                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                                    Start Upload
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>

                            {isLoadingTutorials ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary/30" /></div>
                            ) : tutorials.length === 0 ? (
                                <Card className="border-dashed py-12 text-center text-muted-foreground bg-muted/20">
                                    <p>No external tutorials uploaded yet.</p>
                                    {auth.isAdmin() && <p className="text-xs">Use the button above to upload your first manual.</p>}
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tutorials.map(tut => (
                                        <Card key={tut.id} className="hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform shrink-0">
                                                    {tut.file_type === 'mp4' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm truncate">{tut.title}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{tut.description || 'System tutorial file.'}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => downloadTutorial(tut)}>
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    {auth.isAdmin() && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTutorial(tut)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Mini Dashboard */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-slate-900 border-none shadow-2xl overflow-hidden text-slate-100">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-1.5 bg-white/10 rounded">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    Role Context: {role.toUpperCase()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6 text-sm">
                                <p className="text-slate-400 leading-relaxed">
                                    Your interface is currently operating in <span className="text-white font-bold">{role}</span> profile mode. This manual provides direct guidance for your level of authorization.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span>PDF Report Generation: **Active**</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span>Interactive Roadmap: **Loaded**</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        <span>Local Tutorial Vault: **Synced**</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-500">
                                    <span>System Type: GRC Engine</span>
                                    <span>v1.0.0-Stable</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-muted/30 border-none">
                            <CardHeader className="pb-2 pt-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <ClipboardCheck className="w-3.5 h-3.5" />
                                    Audit Integrity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground leading-relaxed">
                                This manual is dynamically generated based on the Risk Shield RBAC matrix. It ensures that internal security processes are localized and easily understood by different stakeholder groups.
                            </CardContent>
                            <CardFooter>
                                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-2/3" />
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

// Simple Selection helper for the upload dialog
function Select({ value, onValueChange, children }: { value: string, onValueChange: (v: string) => void, children: React.ReactNode }) {
    return (
        <select
            value={value}
            onChange={e => onValueChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {children}
        </select>
    )
}
