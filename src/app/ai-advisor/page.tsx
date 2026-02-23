"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MainLayout } from '@/components/layout/MainLayout'
import { AIAdvisor } from '@/components/audit/AIAdvisor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Info } from 'lucide-react'

export default function GlobalAIAdvisorPage() {
    const supabase = createClient() as any
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
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

                const { data } = await supabase
                    .from('projects')
                    .select('id, name')
                    .eq('organization_id', profile.organization_id)
                    .eq('is_active', true)

                setProjects(data || [])
                if (data && data.length > 0) {
                    setSelectedProjectId(data[0].id)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        loadProjects()
    }, [supabase.auth])

    return (
        <MainLayout>
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Brain className="w-8 h-8 text-primary" />
                            AI Security Intelligence
                        </h1>
                        <p className="text-muted-foreground mt-1">Harness the power of AI to analyze your organization&apos;s risk posture.</p>
                    </div>

                    <div className="w-full md:w-64">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Select Project Context</p>
                        <Select
                            value={selectedProjectId || ''}
                            onValueChange={setSelectedProjectId}
                            disabled={isLoading || projects.length === 0}
                        >
                            <SelectTrigger className="bg-card">
                                <SelectValue placeholder="Choose a project..." />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!selectedProjectId && !isLoading ? (
                    <Card className="border-dashed border-2 py-12">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <Info className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground">Please create a project first to use the AI Security Advisor.</p>
                        </CardContent>
                    </Card>
                ) : selectedProjectId ? (
                    <AIAdvisor projectId={selectedProjectId} />
                ) : (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                <div className="bg-primary/5 rounded-xl p-8 border border-primary/10">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        About AI Advisor (Module 10)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                        <div className="space-y-2">
                            <p className="font-semibold text-foreground">Next-Gen AI Intelligence</p>
                            <p>The AI Advisor is powered by <strong>Google Gemini 1.5 Flash</strong>, providing context-aware security analysis by processing your organizational risks and compliance data in real-time.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-semibold text-foreground">Strategic Guidance</p>
                            <p>Receive human-like strategic recommendations on risk prioritization and mitigation based on the OCTAVE Allegro methodology and global security standards.</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
