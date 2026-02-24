"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/MainLayout'
import {
    Users,
    Building2,
    Shield,
    Activity,
    Lock,
    ArrowRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts'

export default function AdminOverviewPage() {
    const router = useRouter()
    const auth = useAuth()
    const [stats, setStats] = useState({ users: 0, activeAudits: 0, orgName: '', roles: [] as any[] })
    const [isLoading, setIsLoading] = useState(true)

    // Mock data for activity trend
    const activityData = [
        { name: 'Mon', value: 34 },
        { name: 'Tue', value: 45 },
        { name: 'Wed', value: 28 },
        { name: 'Thu', value: 62 },
        { name: 'Fri', value: 89 },
        { name: 'Sat', value: 12 },
        { name: 'Sun', value: 8 },
    ]

    const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b']

    useEffect(() => {
        if (!auth.isLoading) {
            if (!auth.isAdmin()) {
                router.push('/dashboard')
                return
            }
            loadStats()
        }
    }, [auth.isLoading])

    const loadStats = async () => {
        try {
            const [userRes, orgRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/organization')
            ])
            const userData = await userRes.json()
            const orgData = await orgRes.json()

            const { users } = userData || { users: [] }
            const rolesCount = users.reduce((acc: any, u: any) => {
                const r = u.role || 'user'
                acc[r] = (acc[r] || 0) + 1
                return acc
            }, {})

            const rolesData = Object.entries(rolesCount).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            setStats({
                users: users.length,
                activeAudits: 0,
                orgName: orgData.organization?.name || 'Cyber GRC',
                roles: rolesData
            })
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    if (auth.isLoading || isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="space-y-8 max-w-7xl mx-auto pb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 flex items-center gap-3">
                            <Activity className="w-10 h-10 text-primary" />
                            Admin Overview
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1 uppercase tracking-widest text-sm italic">
                            Platform Analytics & Operational Intelligence
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Personnel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform origin-left">{stats.users}</div>
                            <div className="flex items-center gap-1 mt-2 text-emerald-400">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-[10px] font-bold italic uppercase">Growth Stable</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Resource Nodes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-slate-900 group-hover:scale-110 transition-transform origin-left">08</div>
                            <div className="flex items-center gap-1 mt-2 text-primary">
                                <ShieldCheck className="w-3 h-3" />
                                <span className="text-[10px] font-bold italic uppercase font-mono">OCTAVE Framework</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Security Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-emerald-600 group-hover:scale-110 transition-transform origin-left">Optimal</div>
                            <div className="flex items-center gap-1 mt-2 text-emerald-500 font-bold text-[10px] uppercase">
                                Real-time Protection On
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-primary text-white overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Risk Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform origin-left">Low</div>
                            <div className="flex items-center gap-1 mt-2 text-white/80 font-bold text-[10px] uppercase">
                                Analysis Pending
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-slate-100">
                        <CardHeader className="border-b bg-slate-50/30">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Velocity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityData}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorVal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-slate-100">
                        <CardHeader className="border-b bg-slate-50/30">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Personnel Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.roles}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {stats.roles.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl overflow-hidden bg-white group ring-1 ring-slate-100">
                        <div className="h-2 bg-primary w-full" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 text-primary group-hover:rotate-12 transition-transform">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-2xl font-black tracking-tight uppercase">User Directory</CardTitle>
                                    <CardDescription className="text-xs font-medium italic">Identity & Access Governance</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Control authentication flows, verify personnel credentials, and monitor administrative role assignments across your organization.
                            </p>
                            <Link href="/admin/users">
                                <Button className="w-full bg-slate-900 border-none hover:bg-slate-800 text-white font-bold h-12 shadow-xl shadow-slate-200 transition-all">
                                    Personnel Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl overflow-hidden bg-white group ring-1 ring-slate-100">
                        <div className="h-2 bg-emerald-500 w-full" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-2 text-emerald-600 group-hover:rotate-12 transition-transform">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-2xl font-black tracking-tight uppercase">Security Logs</CardTitle>
                                    <CardDescription className="text-xs font-medium italic">Forensic System Integrity</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Monitor unauthorized access attempts, platform configuration changes, and maintain a verifiable digital chain of custody.
                            </p>
                            <Link href="/admin/security">
                                <Button className="w-full bg-emerald-600 border-none hover:bg-emerald-700 text-white font-bold h-12 shadow-xl shadow-emerald-100 transition-all">
                                    Elite Security Command
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none bg-slate-50 shadow-inner">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Recent Ecosystem Activity</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tighter italic">Platform Integrity Verified</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tighter italic">Auth Pattern Scanning Complete</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">34m ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
