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
    Settings,
    ShieldCheck,
    ArrowRight,
    Activity,
    Lock,
    Shield
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
    const router = useRouter()
    const auth = useAuth()
    const [stats, setStats] = useState({ users: 0, activeAudits: 0, orgName: '' })
    const [isLoading, setIsLoading] = useState(true)

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

            setStats({
                users: userData.users?.length || 0,
                activeAudits: 0, // Placeholder
                orgName: orgData.organization?.name || 'Cyber GRC'
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
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
                        <p className="text-muted-foreground mt-1">Manage organization settings and system access controls.</p>
                    </div>
                    <Badge variant="outline" className="w-fit px-3 py-1 bg-primary/5 border-primary/20 text-primary flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        Administrator Access
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Organization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate">{stats.orgName}</div>
                            <p className="text-xs text-muted-foreground mt-1">Primary Root Domain</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Personnel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users}</div>
                            <p className="text-xs text-muted-foreground mt-1">Active Accounts</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-green-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Security Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Optimal</div>
                            <p className="text-xs text-muted-foreground mt-1">System Status</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="group hover:shadow-lg transition-all border-none shadow-sm overflow-hidden flex flex-col">
                        <div className="h-2 bg-blue-500" />
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <CardTitle>User & Access Management</CardTitle>
                            <CardDescription>
                                Create accounts, assign roles (Auditor/Auditee), and manage permissions across the platform.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto pt-0">
                            <Link href="/admin/users" className="w-full">
                                <Button className="w-full group-hover:bg-blue-600 transition-colors">
                                    Manage Users
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all border-none shadow-sm overflow-hidden flex flex-col">
                        <div className="h-2 bg-purple-500" />
                        <CardHeader>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <CardTitle>Organization Profile</CardTitle>
                            <CardDescription>
                                Update company details, industry categorization, and contact information for compliance reporting.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto pt-0">
                            <Link href="/admin/organization" className="w-full">
                                <Button className="w-full group-hover:bg-purple-600 transition-colors">
                                    Manage Organization
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all border-none shadow-sm overflow-hidden flex flex-col border-l-4 border-l-primary lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <CardTitle>Security Command Center</CardTitle>
                                    <CardDescription>
                                        Monitor forensic audit logs, identify unauthorized access attempts, and verify system integrity.
                                    </CardDescription>
                                </div>
                                <Activity className="w-12 h-12 text-primary/20 animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardFooter>
                            <Link href="/admin/security" className="w-full">
                                <Button className="w-full border-2 border-primary/20 hover:bg-primary/10 text-primary bg-transparent group-hover:border-primary transition-all">
                                    Access Security Logs
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                <Card className="border-dashed bg-muted/20">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">System Logs & Activity</CardTitle>
                        </div>
                        <CardDescription>Monitor administrative actions and critical system events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-muted-foreground" />
                                    <span>Administrator Logged In</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Just now</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-4 h-4 text-muted-foreground" />
                                    <span>Security Audit Module Updated</span>
                                </div>
                                <span className="text-xs text-muted-foreground">2 hours ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: string, className?: string }) {
    const variants: Record<string, string> = {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
    }
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
            {children}
        </div>
    )
}
