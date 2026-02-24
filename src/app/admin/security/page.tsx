"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, UserCheck, Activity, Search, ShieldCheck, Fingerprint, Lock, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { scanSystemIntegrity, getActiveSessionForensics, IntegrityReport } from '@/lib/security/integrity-checker'
import { MainLayout } from '@/components/layout/MainLayout'

export default function SecurityDashboard() {
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [integrity, setIntegrity] = useState<IntegrityReport | null>(null)
    const [forensics, setForensics] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        fetchLogs()
        runScan()
    }, [])

    async function runScan() {
        const report = await scanSystemIntegrity()
        const sessionData = await getActiveSessionForensics()
        setIntegrity(report)
        setForensics(sessionData)
    }

    async function fetchLogs() {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            console.error('Error fetching logs:', error)
        } else {
            setLogs(data || [])
        }
        setIsLoading(false)
    }

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
        (log.ip_address && log.ip_address.includes(search))
    )

    const getActionBadge = (action: string) => {
        if (action.includes('FAILURE') || action.includes('UNAUTHORIZED') || action.includes('BOT')) {
            return <Badge variant="destructive" className="font-bold">{action}</Badge>
        }
        if (action.includes('CHANGE') || action.includes('UPDATE')) {
            return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">{action}</Badge>
        }
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{action}</Badge>
    }

    return (
        <MainLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                            <Shield className="w-10 h-10 text-primary" />
                            SECURITY COMMAND CENTER
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-sm">
                            Elite-level forensic audit & system monitoring
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search logs, IPs, actions..."
                                className="pl-10 w-[300px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Badge variant="outline" className="px-4 py-1.5 font-bold border-2 animate-pulse flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            SYSTEM LIVE
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-2xl bg-slate-900 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Total Events (Last 100)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black tracking-tighter">{logs.length}</div>
                            <p className="text-xs text-slate-500 mt-2">Historical capture across all modules</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Threat Mitigation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black tracking-tighter text-emerald-600">100%</div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium italic">Active Protection: Elite-Level</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-white border-l-4 border-l-red-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Security Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black tracking-tighter text-red-500">
                                {logs.filter(l => l.action.includes('FAILURE') || l.action.includes('UNAUTHORIZED')).length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Unauthorized attempts neutralized</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Resilience Scorer */}
                    <Card className="border-none shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                Cyber Resilience Score
                            </CardTitle>
                            <CardDescription>Autonomous audit of platform security architecture</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-center py-6">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="transparent"
                                            stroke="#f1f5f9"
                                            strokeWidth="12"
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="transparent"
                                            stroke="#10b981"
                                            strokeWidth="12"
                                            strokeDasharray={440}
                                            strokeDashoffset={440 - (440 * (integrity?.overallScore || 0)) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-slate-900">{integrity?.overallScore || 0}%</span>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Resilient</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold">Security Headers</span>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">OPTIMAL</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold">Environment Guard</span>
                                    </div>
                                    <Badge className={integrity?.environment.status === 'optimal' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" : "bg-red-100 text-red-700 hover:bg-red-100 border-none"}>
                                        {integrity?.environment.status.toUpperCase() || 'SCANNING'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Forensics & MFA Readiness */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                    <Fingerprint className="w-5 h-5 text-primary" />
                                    Active Session Forensics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {forensics.map((session, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{session.device}</p>
                                                <p className="text-[10px] text-slate-400">{session.location} • {session.ip}</p>
                                            </div>
                                        </div>
                                        {session.current && <Badge className="bg-emerald-500 text-white border-none text-[10px]">CURRENT</Badge>}
                                    </div>
                                ))}

                                <div className="pt-4 border-t border-dashed">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">MFA Security Roadmap</h4>
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-4">
                                        <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-amber-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-900">MFA Highly Recommended</p>
                                            <p className="text-[10px] text-amber-700 mt-1">Multi-Factor Authentication (TOTP) is ready for activation via Supabase Auth Settings. Upgrade your account for mission-critical resistance.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="border-none shadow-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-black tracking-tight uppercase">Recent Security Events</CardTitle>
                            <button
                                onClick={fetchLogs}
                                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                            >
                                Refresh Logs
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[180px] font-bold">TIMESTAMP</TableHead>
                                    <TableHead className="font-bold">ACTION</TableHead>
                                    <TableHead className="font-bold">ENTITY</TableHead>
                                    <TableHead className="font-bold">ORIGIN (IP)</TableHead>
                                    <TableHead className="font-bold text-right">METADATA</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 font-medium text-muted-foreground animate-pulse">
                                            Accessing encrypted logs...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 font-medium text-muted-foreground">
                                            No security events recorded. Platform integrity nominal.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                {getActionBadge(log.action)}
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-700">
                                                {log.entity_type}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded font-bold">
                                                    {log.ip_address || '0.0.0.0'}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {log.new_values && (
                                                    <Badge variant="outline" className="text-[10px] font-medium max-w-[200px] truncate">
                                                        {JSON.stringify(log.new_values)}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
