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
  Settings
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { calculateRiskDistribution } from '@/lib/risk-engine'
import { MainLayout } from '@/components/layout/MainLayout'

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

function RiskLevelBar({ level, count, total, color }: {
  level: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{level}</span>
        <span className="text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
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

export default function DashboardPage() {
  const auth = useAuth()
  const supabase = createClient() as any
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

        const riskDistribution = calculateRiskDistribution(risksData || [])

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
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Good Day, {auth.firstName}!</h1>
            <p className="text-sm md:text-base text-muted-foreground">Monitor your organization&apos;s cybersecurity posture and audit status.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {auth.isAdmin() && (
              <Link href="/admin" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full bg-card">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            {auth.canEdit() && (
              <Link href="/projects/new" className="flex-1 sm:flex-none">
                <Button className="w-full shadow-md">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm overflow-hidden bg-card">
              <CardHeader className="border-b bg-muted/10 px-4 sm:px-6 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">Recent Projects</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Latest risk assessments</CardDescription>
                </div>
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary h-8 px-2 text-xs">
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
                  <div className="divide-y">
                    {projects.map((project) => (
                      <div key={project.id} className="py-5 flex items-center justify-between group">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                            <Badge variant={getStatusVariant(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              Step {project.current_step} of 8 • {project.completedSteps} completed
                            </p>
                            <Progress value={project.progress} className="h-1.5 w-32" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/audit/${project.id}`}>
                            <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-primary/10 hover:text-primary">
                              <ClipboardCheck className="w-4 h-4 mr-1.5" />
                              Audit
                            </Button>
                          </Link>
                          <Link href={`/wizard/${project.id}`}>
                            <Button variant="outline" size="sm" className="h-9 px-3">
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
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-card">
              <CardHeader className="border-b bg-muted/10 px-6 py-4">
                <CardTitle className="text-lg">Risk Distribution</CardTitle>
                <CardDescription>Overview by priority level</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <RiskLevelBar level="Critical" count={stats?.criticalRisks || 0} total={stats?.totalRisks || 1} color="bg-red-500" />
                  <RiskLevelBar level="High" count={stats?.highRisks || 0} total={stats?.totalRisks || 1} color="bg-orange-500" />
                  <RiskLevelBar level="Medium" count={stats?.mediumRisks || 0} total={stats?.totalRisks || 1} color="bg-yellow-500" />
                  <RiskLevelBar level="Low" count={stats?.lowRisks || 0} total={stats?.totalRisks || 1} color="bg-green-500" />
                </div>

                <div className="mt-8 pt-6 border-t">
                  <Link href="/risk-register">
                    <Button variant="outline" className="w-full justify-between group">
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                        View Full Risk Register
                      </span>
                      <Shield className="w-4 h-4 opacity-20" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5 border-primary/10 overflow-hidden">
              <CardHeader className="p-4 bg-primary/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-primary">Compliance Pulse</h3>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <p className="text-xs text-muted-foreground mb-3">Your overall OCTAVE Allegro compliance health across all active audits.</p>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold text-primary">82%</span>
                    <span className="text-xs text-green-600 ml-2 font-medium">↑ 4%</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">Stable</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
