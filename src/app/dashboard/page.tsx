"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DashboardStats, ProjectWithProgress } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import {
  Plus,
  FolderOpen,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Activity,
  AlertTriangle,
  ClipboardCheck,
  Settings,
  Clock,
  Sparkles,
  ArrowUpRight,
  Target,
  FileText,
  AlertCircle
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { calculateRiskDistribution } from '@/lib/risk-engine'
import { MainLayout } from '@/components/layout/MainLayout'
import { RiskMatrix } from '@/components/dashboard/RiskMatrix'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts'

function StatCard({ title, value, description, icon, variant = 'default' }: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  variant?: 'default' | 'destructive' | 'warning'
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-3xl font-bold mt-2",
              variant === 'destructive' && "text-red-600",
              variant === 'warning' && "text-orange-600"
            )}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            variant === 'default' && "bg-primary/10 text-primary",
            variant === 'destructive' && "bg-red-100 text-red-600",
            variant === 'warning' && "bg-orange-100 text-orange-600"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const auth = useAuth()
  const supabase = createClient() as any
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [risks, setRisks] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const riskChartData = stats ? [
    { name: 'Critical', value: stats.criticalRisks, color: '#ef4444' },
    { name: 'High', value: stats.highRisks, color: '#f97316' },
    { name: 'Medium', value: stats.mediumRisks, color: '#eab308' },
    { name: 'Low', value: stats.lowRisks, color: '#22c55e' },
  ].filter(d => d.value > 0) : []

  const trendData = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 59 },
    { name: 'Week 3', score: 80 },
    { name: 'Week 4', score: 81 },
    { name: 'Week 5', score: 56 },
    { name: 'Week 6', score: 55 },
    { name: 'Week 7', score: stats?.complianceScore || 40 },
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .single()

        if (!profile) return

        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5)

        const projectsWithProgress = (projectsData as any[] || []).map((project: any) => {
          const completedSteps = [
            project.step_1_completed, project.step_2_completed, project.step_3_completed, project.step_4_completed,
            project.step_5_completed, project.step_6_completed, project.step_7_completed, project.step_8_completed,
          ].filter(Boolean).length

          return {
            ...project,
            progress: Math.round((completedSteps / 8) * 100),
            completedSteps,
          }
        })

        setProjects(projectsWithProgress)

        const { data: risksData } = await supabase
          .from('risks')
          .select('*')
          .in('project_id', projectsWithProgress.map((p: any) => p.id))

        setRisks(risksData || [])
        const riskDistribution = calculateRiskDistribution(risksData || [])

        // Fetch Assets
        const { data: assetsData } = await supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectsWithProgress[0]?.id)
          .eq('is_active', true)

        setAssets(assetsData || [])

        setStats({
          totalProjects: projectsWithProgress.length,
          activeRisks: risksData?.length || 0,
          criticalRisks: riskDistribution.critical,
          highRisks: riskDistribution.high,
          mediumRisks: riskDistribution.medium,
          lowRisks: riskDistribution.low,
          totalRisks: risksData?.length || 0,
          activeProjects: projectsWithProgress.filter((p: any) => p.status === 'in_progress').length,
          completedProjects: projectsWithProgress.filter((p: any) => p.status === 'completed').length,
          riskDistribution,
          complianceScore: projectsWithProgress.length > 0
            ? Math.round(projectsWithProgress.reduce((acc, p) => acc + p.progress, 0) / projectsWithProgress.length)
            : 0
        } as any)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase.auth])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading GRC Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground italic uppercase italic font-black">Good Day, {auth.firstName}!</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">Monitor your organization&apos;s cybersecurity posture and audit status.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {auth.isAdmin() && (
              <Link href="/admin" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full bg-card border-2 font-bold hover:bg-slate-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            {auth.canEdit() && (
              <Link href="/projects/new" className="flex-1 sm:flex-none">
                <Button className="w-full shadow-lg shadow-primary/20 font-bold">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Projects"
            value={stats?.totalProjects || 0}
            description={`${stats?.activeProjects || 0} currently active`}
            icon={<FolderOpen className="w-5 h-5" />}
          />
          <StatCard
            title="Critical Risks"
            value={stats?.criticalRisks || 0}
            description="Require immediate attention"
            icon={<ShieldAlert className="w-5 h-5" />}
            variant="destructive"
          />
          <StatCard
            title="High Risks"
            value={stats?.highRisks || 0}
            description="Priority mitigation needed"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="warning"
          />
          <StatCard
            title="Total Risks"
            value={stats?.totalRisks || 0}
            description={`${stats?.lowRisks || 0} low risk entries`}
            icon={<ShieldCheck className="w-5 h-5" />}
          />
        </div>

        {/* Projects and Risks Distribution */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl overflow-hidden bg-card ring-1 ring-slate-100">
            <CardHeader className="border-b bg-slate-50/50 px-4 sm:px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Recent Projects</CardTitle>
                <CardDescription className="text-xs sm:text-sm font-medium">Latest risk assessments</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary h-8 px-2 text-xs font-black uppercase tracking-widest">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-6 py-2">
              {projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No projects yet. Create your first project to get started.</p>
                  <Link href="/projects/new" className="mt-4 inline-block">
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {projects.map((project) => (
                    <div key={project.id} className="py-5 flex items-center justify-between group">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                          <Badge variant={getStatusVariant(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Step {project.current_step} of 8 • {project.completedSteps} completed
                          </p>
                          <Progress value={project.progress} className="h-1.5 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/audit/${project.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 px-3 font-bold hover:bg-primary/10 hover:text-primary">
                            <ClipboardCheck className="w-4 h-4 mr-1.5" />
                            Audit
                          </Button>
                        </Link>
                        <Link href={`/wizard/${project.id}`}>
                          <Button variant="outline" size="sm" className="h-9 px-4 font-bold border-2">
                            Open
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Risk Intelligence */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white ring-1 ring-slate-100 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 py-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-bold">Risk Matrix Heatmap</CardTitle>
                </div>
                <CardDescription className="text-xs font-medium italic">Likelihood vs. Impact Analysis</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RiskMatrix risks={risks} />
              </CardContent>
            </Card>

            <div className="space-y-8">
              {/* Project Deadlines/Timeline */}
              <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden flex flex-col">
                <CardHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="font-black uppercase tracking-widest text-[10px]">Strategic Timeline</h3>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black italic uppercase italic">Active Phase</Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {projects[0] ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Objective</p>
                        <h4 className="font-bold text-sm text-white truncate">{projects[0].name}</h4>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-4xl font-black tracking-tighter">
                            {projects[0].target_completion_date
                              ? Math.max(0, Math.ceil((new Date(projects[0].target_completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                              : 'N/A'
                            }
                          </p>
                          <p className="text-[10px] uppercase font-black text-slate-500">
                            {projects[0].target_completion_date ? 'Days Remaining' : 'No Deadline Set'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary">{projects[0].progress}%</p>
                          <p className="text-[10px] uppercase font-black text-slate-500 italic">Current Velocity</p>
                        </div>
                      </div>
                      <Progress value={projects[0].progress} className="h-1.5 bg-white/10" />
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No active projects to track.</p>
                  )}
                </CardContent>
              </Card>

              {/* AI Advisor Card */}
              <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 via-primary to-blue-500 text-white overflow-hidden relative group min-h-[180px]">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-24 h-24 rotate-12 group-hover:scale-110 transition-transform" />
                </div>
                <CardHeader className="p-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-widest text-[10px]">AI Security Advisor</h3>
                      <p className="text-[8px] text-white/60 font-medium">Real-time Strategy</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 relative">
                  <p className="text-xs font-bold leading-relaxed italic pr-4">
                    {stats?.criticalRisks && stats.criticalRisks > 0
                      ? `Attention! Analysis identifies ${stats.criticalRisks} critical vulnerabilities. Focus immediate remediation on "Step 8: Impact Mitigation" to safeguard core assets.`
                      : stats?.highRisks && stats.highRisks > 0
                        ? `Organization posture is guarded. Recommendation: Review high-priority risks in Project "${projects[0]?.name}" and ensure evidence collection is optimized.`
                        : "System integrity is optimal. Maintain current monitoring cadence and proceed with scheduled audits."
                    }
                  </p>
                  <Link href="/ai-advisor">
                    <Button className="mt-6 w-full h-9 bg-white text-primary hover:bg-white/90 border-none font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/20">
                      GET DETAILED INSIGHTS
                      <ArrowUpRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Vulnerable Assets */}
          <div className="mt-8">
            <Card className="border-none shadow-xl bg-card ring-1 ring-slate-100 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 px-6 py-4 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-lg font-bold">Top Vulnerable Assets</CardTitle>
                  </div>
                  <CardDescription className="text-xs font-medium italic">High-impact components requiring protection</CardDescription>
                </div>
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-black uppercase tracking-widest text-primary">All Projects</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {assets.length > 0 ? (
                    assets.sort((a, b) => (b.max_impact || 0) - (a.max_impact || 0)).slice(0, 4).map((asset) => (
                      <div key={asset.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm",
                            asset.max_impact >= 4 ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-400"
                          )}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{asset.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[8px] uppercase font-black tracking-widest h-4 px-1">{asset.asset_type}</Badge>
                              <span className="text-[10px] text-muted-foreground font-medium">Impact Level: {asset.max_impact}/5</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Status</p>
                            <Badge className={cn(
                              "text-[8px] font-black uppercase tracking-widest",
                              asset.max_impact >= 4 ? "bg-red-500/10 text-red-600 border-none" : "bg-emerald-500/10 text-emerald-600 border-none"
                            )}>
                              {asset.max_impact >= 4 ? 'HIGH RISK' : 'STABLE'}
                            </Badge>
                          </div>
                          <Link href={`/wizard/${asset.project_id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No assets prioritized yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-card ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
              <CardTitle className="text-lg font-bold">Risk Distribution</CardTitle>
              <CardDescription className="font-medium">Overview by priority level</CardDescription>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              {stats?.totalRisks === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <Shield className="w-12 h-12 mb-2" />
                  <p className="text-sm font-medium">No risk data recorded</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
            <div className="px-6 pb-6 pt-0">
              <Link href="/risk-register">
                <Button variant="outline" className="w-full justify-between group h-11 font-bold border-2 hover:bg-slate-50 transition-all">
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                    Risk Register
                  </span>
                  <Shield className="w-4 h-4 opacity-20" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="border-none shadow-xl bg-card ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Risk Posture Trend</CardTitle>
                  <CardDescription className="text-xs font-medium italic">Security trajectory over last 7 weeks</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-black italic">IMPROVING</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-primary text-white overflow-hidden group">
            <CardHeader className="p-4 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <h3 className="font-black uppercase tracking-widest text-xs">Compliance Pulse</h3>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs text-white/70 mb-4 font-medium italic">Your OCTAVE Allegro compliance health is currently {((stats as any)?.complianceScore || 0) > 70 ? 'optimal' : 'stable'}.</p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-black tracking-tighter">{(stats as any)?.complianceScore || 0}%</span>
                  <span className="text-xs text-white/50 ml-2 font-bold uppercase">↑ 4.2%</span>
                </div>
                <Badge className="bg-white text-primary hover:bg-white font-black text-[10px]">
                  {((stats as any)?.complianceScore || 0) > 80 ? 'EXCELLENT' : ((stats as any)?.complianceScore || 0) > 60 ? 'OPTIMAL' : 'MONITOR'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed': return 'default'
    case 'in_progress': return 'secondary'
    case 'archived': return 'outline'
    default: return 'outline'
  }
}
