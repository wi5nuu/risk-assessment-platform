"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Loader2, Brain, Lightbulb, Send, MessageSquare,
    Sparkles, ShieldCheck, AlertTriangle, Info,
    ChevronRight, ArrowRight, Target, Shield
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AIAdvisorProps {
    projectId: string
}

interface StructuredAdvice {
    summary: string
    compliance_status: {
        score: number
        label: string
    }
    priorities: Array<{
        id: number
        title: string
        risk_score: number
        severity: 'critical' | 'high' | 'medium' | 'low'
        analogy: string
        impact: {
            operational: string
            financial: string
            reputational: string
        }
        recommendations: string[]
    }>
    strategic_roadmap: string[]
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
    const [structuredAdvice, setStructuredAdvice] = useState<StructuredAdvice | null>(null)
    const [rawAdvice, setRawAdvice] = useState<string | null>(null)
    const [question, setQuestion] = useState('')
    const [qaPairs, setQaPairs] = useState<{ q: string; a: string }[]>([])
    const [isThinking, setIsThinking] = useState(false)

    const runAnalysis = async () => {
        setIsAnalyzing(true)
        try {
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

            const prompt = "Please conduct the high-level security analysis based on the methodology (OCTAVE Allegro) and provide the response in the required JSON format."

            const response = await fetch('/api/ai-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get analysis');
            }

            const data = await response.json();

            try {
                const parsed = JSON.parse(data.advice)
                setStructuredAdvice(parsed)
                setRawAdvice(null)
            } catch (e) {
                console.warn("AI response was not valid JSON, falling back to markdown")
                setRawAdvice(data.advice)
                setStructuredAdvice(null)
            }
        } catch (err: any) {
            toast.error(err.message || 'AI Analysis failed.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleQuestion = async () => {
        if (!question.trim() || isThinking) return

        setIsThinking(true)
        const currentQuestion = question
        setQuestion('')

        try {
            const response = await fetch('/api/ai-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentQuestion })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }

            const data = await response.json();
            setQaPairs(prev => [...prev, { q: currentQuestion, a: data.advice }])
        } catch (err: any) {
            toast.error(err.message || 'Gemini AI is unavailable.')
        } finally {
            setIsThinking(false)
        }
    }

    const severityConfig = {
        critical: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        high: { icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
        medium: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        low: { icon: Info, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4 text-xs font-black tracking-widest uppercase">
                            Premium Security Intelligence
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                            AI Security Advisor
                        </h1>
                        <p className="text-slate-400 max-w-md text-sm md:text-base font-medium">
                            Harness advanced generative AI to transform your compliance data into professional security strategy.
                        </p>
                    </div>

                    <Button
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 group"
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> ANALYZING ASSETS...</>
                        ) : (
                            <><Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" /> GENERATE STRATEGIC REPORT</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Analysis Results */}
            <AnimatePresence mode="wait">
                {structuredAdvice && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {/* Summary & Compliance Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2 rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                                <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                    <CardTitle className="text-base font-black flex items-center gap-2 text-slate-800">
                                        <Target className="w-4 h-4 text-primary" />
                                        EXECUTIVE SUMMARY
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 font-medium text-slate-600 leading-relaxed">
                                    {structuredAdvice.summary}
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-xs font-black tracking-widest uppercase text-slate-400">Compliance Score</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-6xl font-black">{structuredAdvice.compliance_status.score}%</div>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${structuredAdvice.compliance_status.score}%` }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-primary">{structuredAdvice.compliance_status.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Priorities */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {structuredAdvice.priorities.map((p, i) => {
                                const cfg = severityConfig[p.severity as keyof typeof severityConfig] || severityConfig.medium
                                return (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Card className="h-full rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden flex flex-col group hover:ring-2 hover:ring-primary/20 transition-all">
                                            <div className={`${cfg.bg} px-6 py-4 border-b ${cfg.border} flex items-center justify-between`}>
                                                <div className="flex items-center gap-2">
                                                    <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{p.severity}</span>
                                                </div>
                                                <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold">Priority #{p.id}</Badge>
                                            </div>
                                            <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                                                <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">{p.title}</h3>

                                                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-sm text-slate-600 font-medium">
                                                    <div className="flex items-center gap-2 mb-1 not-italic">
                                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">The Analogy</span>
                                                    </div>
                                                    "{p.analogy}"
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Impact</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(p.impact).map(([key, value]) => (
                                                            <div key={key} className="flex gap-3 items-start">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                                                <p className="text-xs text-slate-600 font-medium"><span className="font-bold text-slate-800 capitalize">{key}:</span> {value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-50 mt-auto space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Key Actions</h4>
                                                    <div className="space-y-2">
                                                        {p.recommendations.map((rec, ri) => (
                                                            <div key={ri} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                                <ChevronRight className="w-3 h-3 text-primary" />
                                                                {rec}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Roadmap Section */}
                        <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                            <CardHeader className="border-b border-slate-50 pb-4">
                                <CardTitle className="text-base font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                                    <Shield className="w-4 h-4 text-primary" />
                                    STRATEGIK ROADMAP PARA MANAGEMENT
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    {structuredAdvice.strategic_roadmap.map((step, si) => (
                                        <div key={si} className="p-6 flex gap-6 items-center group hover:bg-slate-50/50 transition-colors">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                {si + 1}
                                            </div>
                                            <p className="flex-1 font-bold text-slate-700 leading-snug">{step}</p>
                                            <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-primary transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {rawAdvice && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className="rounded-3xl border-l-8 border-l-primary shadow-xl p-8 bg-white">
                            <MarkdownContent content={rawAdvice} />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Interaction Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Ask the Expert Advisor</h2>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>

                <div className="space-y-6 max-w-4xl mx-auto">
                    {qaPairs.map((pair, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex justify-end pr-4">
                                <div className="bg-slate-800 text-slate-100 rounded-3xl rounded-tr-none px-6 py-4 shadow-lg max-w-[80%]">
                                    <p className="text-sm font-bold">{pair.q}</p>
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white rounded-3xl rounded-tl-none px-8 py-6 max-w-[90%] shadow-xl shadow-slate-200/50 border border-slate-50">
                                    <div className="flex items-center gap-2 mb-4 text-primary">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Advisor Insights</span>
                                    </div>
                                    <MarkdownContent content={pair.a} />
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isThinking && (
                        <div className="flex justify-start animate-fade-in pl-10">
                            <div className="bg-slate-100 rounded-2xl px-6 py-4 flex items-center gap-4">
                                <div className="flex gap-1">
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Thinking deeply...</span>
                            </div>
                        </div>
                    )}

                    <div className="relative group/input pt-4">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-[2.5rem] blur opacity-25 group-focus-within/input:opacity-100 transition-opacity" />
                        <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-xl p-2 flex items-center pr-4">
                            <Textarea
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                placeholder="Tanyakan apa saja tentang strategi keamanan Anda..."
                                className="min-h-[60px] max-h-[150px] border-none focus-visible:ring-0 shadow-none text-sm font-bold placeholder:text-slate-300 resize-none px-6 py-4 flex-1"
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuestion() } }}
                                disabled={isThinking}
                            />
                            <Button
                                onClick={handleQuestion}
                                size="lg"
                                className="rounded-2xl w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 p-0"
                                disabled={isThinking || !question.trim()}
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

