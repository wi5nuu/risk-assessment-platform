"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DashboardStats, ProjectWithProgress } from '@/types'
import {
  Plus,
  FolderOpen,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { calculateRiskDistribution } from '@/lib/risk-engine'

export default function DashboardPage() {
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
            project.step_1_completed,
            project.step_2_completed,
            project.step_3_completed,
            project.step_4_completed,
            project.step_5_completed,
            project.step_6_completed,
            project.step_7_completed,
            project.step_8_completed,
          ].filter(Boolean).length

          return {
            ...project,
            progress: Math.round((completedSteps / 8) * 100),
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
          mitigationProgress: 65,
          riskDistribution,
          activeProjects: projectsWithProgress.filter((p: any) => p.status === 'in_progress').length,
          completedProjects: projectsWithProgress.filter((p: any) => p.status === 'completed').length,
          totalRisks: risksData?.length || 0,
          highRisks: riskDistribution.high,
          mediumRisks: riskDistribution.medium,
          lowRisks: riskDistribution.low,
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  OCTAVE Allegro Risk Assessment Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/projects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Projects"
            value={stats?.totalProjects || 0}
            description={`${stats?.activeProjects || 0} active`}
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
            description={`${stats?.lowRisks || 0} low risk`}
            icon={<ShieldCheck className="w-5 h-5" />}
          />
        </div>

        {/* Projects Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your latest risk assessment projects</CardDescription>
                </div>
                <Link href="/projects">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet. Create your first project to get started.</p>
                    <Link href="/projects/new" className="mt-4 inline-block">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{project.name}</h3>
                            <Badge variant={getStatusVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Step {project.current_step} of 8 • {project.completedSteps} completed
                          </p>
                          <Progress
                            value={project.progress}
                            className="mt-2 h-2"
                          />
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right text-sm text-muted-foreground">
                            <p>Created</p>
                            <p>{formatDate(project.created_at)}</p>
                          </div>
                          <Link href={`/wizard/${project.id}`}>
                            <Button variant="outline" size="sm">
                              Continue
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

          {/* Risk Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Risk Summary</CardTitle>
                <CardDescription>Distribution by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RiskLevelBar
                    level="Critical"
                    count={stats?.criticalRisks || 0}
                    total={stats?.totalRisks || 1}
                    color="bg-red-500"
                  />
                  <RiskLevelBar
                    level="High"
                    count={stats?.highRisks || 0}
                    total={stats?.totalRisks || 1}
                    color="bg-orange-500"
                  />
                  <RiskLevelBar
                    level="Medium"
                    count={stats?.mediumRisks || 0}
                    total={stats?.totalRisks || 1}
                    color="bg-yellow-500"
                  />
                  <RiskLevelBar
                    level="Low"
                    count={stats?.lowRisks || 0}
                    total={stats?.totalRisks || 1}
                    color="bg-green-500"
                  />
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Link href="/risk-register">
                    <Button variant="outline" className="w-full">
                      <Activity className="w-4 h-4 mr-2" />
                      View Risk Register
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  variant?: 'default' | 'destructive' | 'warning'
}

function StatCard({ title, value, description, icon, variant = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
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

interface RiskLevelBarProps {
  level: string
  count: number
  total: number
  color: string
}

function RiskLevelBar({ level, count, total, color }: RiskLevelBarProps) {
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
    case 'completed':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'archived':
      return 'outline'
    default:
      return 'outline'
  }
}
