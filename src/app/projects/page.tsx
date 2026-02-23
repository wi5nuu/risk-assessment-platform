"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, FolderOpen, ArrowRight, Clock, Target } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ProjectsListPage() {
  const supabase = createClient() as any
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
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

        const projectsWithProgress = (projectsData as any[] || []).map(p => {
          const completedSteps = [
            p.step_1_completed, p.step_2_completed, p.step_3_completed, p.step_4_completed,
            p.step_5_completed, p.step_6_completed, p.step_7_completed, p.step_8_completed,
          ].filter(Boolean).length

          return {
            ...p,
            progress: Math.round((completedSteps / 8) * 100),
            completedSteps,
          }
        })

        setProjects(projectsWithProgress)
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [supabase.auth])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Risk Assessment Projects</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm font-medium">Manage and track your OCTAVE Allegro security risk assessments.</p>
          </div>
          <Link href="/projects/new" className="sm:flex-none">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-card rounded-xl border-2 border-dashed">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground">No risk assessment projects found.</p>
              <Link href="/projects/new" className="mt-4 inline-block">
                <Button variant="outline">Start Your First Assessment</Button>
              </Link>
            </div>
          ) : (
            projects.map((p) => (
              <Card key={p.id} className="group hover:shadow-md transition-all border-none shadow-sm flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>
                      {p.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{p.id.slice(0, 8)}</span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{p.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">{p.description || 'No description provided.'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Assessment Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.4 h-3.4" />
                      {formatDate(p.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3.4 h-3.4" />
                      {p.completedSteps}/8 Steps
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Link href={`/wizard/${p.id}`}>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      Continue Analysis
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}
