"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProjectWithProgress } from '@/types'
import { Plus, FolderOpen, ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const supabase = createClient() as any
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .single()

      if (!profile) return

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const projectsWithProgress: ProjectWithProgress[] = (data as any[] || []).map((project: any) => {
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
          completedSteps,
          totalSteps: 8,
        }
      })

      setProjects(projectsWithProgress)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (project: ProjectWithProgress) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', project.id)

      if (error) throw error
      toast.success('Project deleted')
      loadProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

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
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Projects</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your risk assessment projects
                </p>
              </div>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first risk assessment project to get started.
            </p>
            <Link href="/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDate(project.created_at)}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Step {project.current_step} of 8 • {project.completedSteps} completed
                      </p>
                    </div>

                    {project.target_completion_date && (
                      <p className="text-sm text-muted-foreground">
                        Target: {formatDate(project.target_completion_date)}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link href={`/wizard/${project.id}`} className="flex-1">
                        <Button className="w-full" variant={project.progress === 100 ? 'outline' : 'default'}>
                          {project.progress === 100 ? 'View' : 'Continue'}
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(project)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
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
