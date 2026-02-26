"use client"

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import {
    FileText, Shield, Download, CheckCircle2, AlertTriangle,
    Lock, Eye, BookOpen, Scale, Users, Loader2, ShieldCheck,
    GraduationCap, Fingerprint
} from 'lucide-react'
import { generateReportPDF } from '@/lib/report-pdf-generator'

export default function AdminReportPage() {
    const auth = useAuth()
    const [showDownloadForm, setShowDownloadForm] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [formData, setFormData] = useState({ fullName: '', studentId: '', email: '' })
    const [isValidating, setIsValidating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleValidateAndDownload = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsValidating(true)
        setError(null)

        try {
            const res = await fetch('/api/admin/validate-report-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Validation failed.')
                return
            }

            setSuccess(true)

            // Generate and download PDF
            setTimeout(() => {
                generateReportPDF(data.user.fullName, data.user.studentId)
            }, 500)

        } catch (err: any) {
            setError('Network error. Please try again.')
        } finally {
            setIsValidating(false)
        }
    }

    if (auth.isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <MainLayout>
            <div className="max-w-5xl space-y-6 pb-10 -mt-2 md:-mt-4">
                {/* Header */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 50%)' }} />
                    <div className="relative p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-indigo-400/30">
                                <FileText className="w-6 h-6 text-indigo-300" />
                            </div>
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px] font-black uppercase tracking-widest">
                                Classified Document
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Mini Project Report
                        </h1>
                        <p className="text-slate-300/80 mt-2 text-sm max-w-xl">
                            Cyber Security Risk Management and Audit — Comprehensive documentation of the Risk Shield System.
                        </p>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-none shadow-lg ring-1 ring-slate-100">
                        <CardContent className="p-5">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-sm">Purpose</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Document the complete implementation of the OCTAVE Allegro framework in our Risk Shield System.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg ring-1 ring-slate-100">
                        <CardContent className="p-5">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                                <GraduationCap className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-sm">Academic Use</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                This report fulfills the requirements for the Cyber Security Risk Management and Audit course at President University.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg ring-1 ring-slate-100">
                        <CardContent className="p-5">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                                <Shield className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-sm">Confidential</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Access restricted to authorized team members only. All downloads are logged and monitored.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Contents Overview */}
                <Card className="border-none shadow-xl ring-1 ring-slate-100">
                    <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-bold">Report Contents</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-medium italic">What&apos;s included in this document</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: 'Framework Theory', desc: 'OCTAVE Allegro, OWASP, GRC principles', icon: BookOpen },
                                { title: 'Risk Assessment Process', desc: '8-step methodology with detailed explanation', icon: ShieldCheck },
                                { title: 'System Architecture', desc: 'Next.js, Supabase, AI, Security stack', icon: Shield },
                                { title: 'User Manual', desc: 'Getting started, navigation, all features', icon: Users },
                                { title: 'Compliance Alignment', desc: 'ISO 27001, NIST, OWASP, GDPR', icon: Scale },
                                { title: 'Troubleshooting', desc: 'Error messages, support contacts', icon: AlertTriangle },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <item.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Terms & Conditions */}
                <Card className="border-none shadow-xl ring-1 ring-slate-100">
                    <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-bold">Terms & Conditions</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-medium italic">Please read before downloading</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div className="space-y-2 text-xs text-amber-900">
                                    <p className="font-bold">By downloading this report, you agree to the following:</p>
                                    <ol className="list-decimal list-inside space-y-1.5 ml-1">
                                        <li>This document is <strong>CONFIDENTIAL</strong> and intended solely for authorized team members of the Risk Shield System project.</li>
                                        <li>You may <strong>NOT</strong> distribute, share, copy, or reproduce this document without prior written consent from all team members.</li>
                                        <li>This report is for <strong>academic purposes only</strong> and is submitted as part of the Cyber Security Risk Management and Audit course at President University.</li>
                                        <li>All downloads are <strong>logged with your identity, timestamp, and IP address</strong> for security auditing purposes.</li>
                                        <li>Any unauthorized use of this document may result in <strong>academic disciplinary action</strong>.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-primary/50 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-bold text-foreground">
                                I have read, understood, and agree to the terms and conditions above.
                            </span>
                        </label>
                    </CardContent>
                </Card>

                {/* Download Section */}
                <Card className={`border-none shadow-xl ring-1 transition-all ${agreedToTerms ? 'ring-primary/30 bg-primary/[0.02]' : 'ring-slate-100 opacity-60'}`}>
                    <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Download className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-bold">Download Report</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-medium italic">Identity verification required</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!showDownloadForm && !success && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Fingerprint className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                    To download the report, you must verify your identity as an authorized team member. Your credentials will be checked against the secure database.
                                </p>
                                <Button
                                    size="lg"
                                    disabled={!agreedToTerms}
                                    onClick={() => setShowDownloadForm(true)}
                                    className="px-8 font-bold shadow-lg shadow-primary/20"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Verify Identity & Download
                                </Button>
                            </div>
                        )}

                        {showDownloadForm && !success && (
                            <form onSubmit={handleValidateAndDownload} className="max-w-md mx-auto space-y-5">
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Fingerprint className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h3 className="font-bold text-lg">Identity Verification</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Enter your credentials exactly as registered</p>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="w-4 h-4" />
                                        <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="e.g. Wisnu Alfian Nur Ashar"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                        required
                                        disabled={isValidating}
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="studentId" className="text-xs font-bold uppercase tracking-wider text-slate-500">Student ID (NIM)</Label>
                                    <Input
                                        id="studentId"
                                        placeholder="e.g. 001202400138"
                                        value={formData.studentId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                                        required
                                        disabled={isValidating}
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="e.g. wisnu.ashar@student.president.ac.id"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        disabled={isValidating}
                                        className="h-11"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setShowDownloadForm(false); setError(null) }}
                                        disabled={isValidating}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isValidating}
                                        className="flex-1 font-bold shadow-lg shadow-primary/20"
                                    >
                                        {isValidating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4 mr-2" />
                                                Verify & Download
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {success && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-700">Identity Verified!</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-6">
                                    Your report is being generated and will download automatically.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSuccess(false); setShowDownloadForm(false); setAgreedToTerms(false); setFormData({ fullName: '', studentId: '', email: '' }) }}
                                    className="font-bold"
                                >
                                    Done
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
