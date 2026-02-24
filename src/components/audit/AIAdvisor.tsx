"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Brain, Lightbulb, Send, MessageSquare, Sparkles } from 'lucide-react'
import { getGeminiAdvice } from '@/lib/gemini'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AIAdvisorProps {
    projectId: string
}

interface Advice {
    title: string
    body: string
    priority: 'info' | 'warning' | 'critical'
}

const MarkdownContent = ({ content }: { content: string }) => {
    return (
        <div className="prose prose-sm prose-slate max-w-none 
                prose-p:leading-relaxed prose-p:mb-4 
                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mb-2 prose-headings:mt-4
                prose-ul:list-disc prose-ul:pl-4 prose-ul:mb-4
                prose-li:mb-1
                prose-strong:text-slate-900 prose-strong:font-black
                text-slate-700 font-medium">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    )
}

export function AIAdvisor({ projectId }: AIAdvisorProps) {
    const supabase = createClient() as any
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [adviceList, setAdviceList] = useState<Advice[]>([])
    const [question, setQuestion] = useState('')
    const [qaPairs, setQaPairs] = useState<{ q: string; a: string }[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [hasData, setHasData] = useState(false)

    useEffect(() => {
        checkData()
    }, [projectId])

    const checkData = async () => {
        const { data } = await supabase
            .from('risks')
            .select('id')
            .eq('project_id', projectId)
            .limit(1)
        setHasData(!!data && data.length > 0)
    }

    const runAnalysis = async () => {
        setIsAnalyzing(true)
        try {
            // Fetch project data for analysis
            const [risksRes, findingsRes, checklistRes, orgRes] = await Promise.all([
                supabase.from('risks').select('*, risk_vulnerability_mapping(vulnerability_id, vulnerabilities(name, category))').eq('project_id', projectId).eq('is_active', true),
                supabase.from('audit_findings').select('*').eq('project_id', projectId),
                supabase.from('audit_checklists').select('*, audit_items(*)').eq('project_id', projectId).maybeSingle(),
                supabase.from('organizations').select('*').limit(1).single(),
            ])

            const context = {
                organization: orgRes.data?.name,
                risks: risksRes.data?.map((r: any) => ({
                    title: r.risk_title,
                    level: r.risk_level,
                    score: r.risk_score,
                    vulnerabilities: r.risk_vulnerability_mapping?.map((m: any) => m.vulnerabilities?.name)
                })),
                findings: findingsRes.data?.map((f: any) => ({
                    issue: f.issue,
                    severity: f.severity
                })),
                complianceScore: checklistRes.data?.compliance_score
            }

            const prompt = "Conduct a high-level security analysis based on the provided project data. Identify the top 3 priorities and provide strategic advice for management."
            const rawAdvice = await getGeminiAdvice(prompt, context)

            // For now, let's treat the bulk response as a single 'critical' advice for visibility, 
            // but in a real app, we might want Gemini to return JSON.
            setAdviceList([{
                title: "Gemini Comprehensive Analysis",
                body: rawAdvice,
                priority: 'critical' as 'critical'
            }])
        } catch (err) {
            console.error(err)
            toast.error('AI Analysis failed. Please check your internet connection.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleQuestion = async () => {
        if (!question.trim() || isThinking) return

        setIsThinking(true)
        const currentQuestion = question
        setQuestion('')
        setHasData(true)

        try {
            const answer = await getGeminiAdvice(currentQuestion)
            setQaPairs(prev => [...prev, { q: currentQuestion, a: answer }])
        } catch (err) {
            toast.error('Gemini AI is unavailable. Please try again later.')
        } finally {
            setIsThinking(false)
        }
    }

    const priorityColors: Record<string, string> = {
        critical: 'border-l-4 border-l-red-500 bg-red-50/50',
        warning: 'border-l-4 border-l-yellow-500 bg-yellow-50/50',
        info: 'border-l-4 border-l-blue-500 bg-blue-50/50',
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Security Advisor
                    </CardTitle>
                    <CardDescription>
                        Get automated security insights based on your risk assessment and audit data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={runAnalysis} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Lightbulb className="w-4 h-4 mr-2" /> Run Security Analysis</>}
                    </Button>

                    {adviceList.length > 0 && (
                        <div className="space-y-3 mt-4">
                            {adviceList.map((advice, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border ${priorityColors[advice.priority]} shadow-sm`}>
                                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-primary" />
                                        {advice.title}
                                    </h4>
                                    <MarkdownContent content={advice.body} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Ask the AI Advisor</CardTitle>
                    <CardDescription>Ask about vulnerabilities, compliance, risk scoring, or mitigation strategies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {qaPairs.map((pair, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="flex justify-end"><div className="bg-primary/10 rounded-lg px-3 py-2 max-w-[80%] shadow-sm"><p className="text-sm font-medium">{pair.q}</p></div></div>
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl px-5 py-4 max-w-[90%] shadow-sm border border-slate-100 ring-1 ring-slate-50">
                                    <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Official Response</span>
                                    </div>
                                    <MarkdownContent content={pair.a} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg px-4 py-3 shadow-sm flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground italic">AI Advisor is thinking...</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Textarea
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="e.g., Explain SQL Injection risk to management"
                            className="min-h-[40px] resize-none"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuestion() } }}
                            disabled={isThinking}
                        />
                        <Button onClick={handleQuestion} size="icon" className="shrink-0 h-[40px] w-[40px]" disabled={isThinking || !question.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

