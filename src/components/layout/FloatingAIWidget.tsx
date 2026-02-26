"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, Send, Loader2, MessageSquare, Shield, Target, Activity, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function FloatingAIWidget() {
    const { role } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I am **ShieldBot**. I can help you monitor your risk data and projects instantly. What would you like to know?' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [context, setContext] = useState<any>(null)
    const [tooltipIndex, setTooltipIndex] = useState(0)
    const [showTooltip, setShowTooltip] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const tooltips = [
        `Hi ${role || 'user'}!`,
        "What can I help?",
        "Check your risks here",
        "Monitor your projects",
        "100% Offline & Private"
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setTooltipIndex((prev) => (prev + 1) % tooltips.length)
        }, 10000)
        return () => clearInterval(interval)
    }, [tooltips.length])

    useEffect(() => {
        if (isOpen && !context) {
            fetchContext()
        }
        if (isOpen) setShowTooltip(false)
        else setShowTooltip(true)
    }, [isOpen, context])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchContext = async () => {
        try {
            const res = await fetch('/api/ai-context')
            if (res.ok) {
                const data = await res.json()
                setContext(data)
            }
        } catch (err) {
            console.error('Failed to fetch AI context:', err)
        }
    }

    const processLocalResponse = (query: string): string => {
        const q = query.toLowerCase()
        if (!context) return "Synchronizing database data..."

        const organizationName = context.organization?.name || "your organization";

        // 1. Platform Purpose & OCTAVE Knowledge
        if (q.includes('octave') || q.includes('method') || q.includes('allegro')) {
            return "This platform uses the **OCTAVE Allegro** (Operationally Critical Threat, Asset, and Vulnerability Evaluation) methodology. It focuses on information assets and operational risks to minimize security impact on your business."
        }

        if (q.includes('purpose') || q.includes('what is this') || q.includes('website goal')) {
            return `The goal of **Risk Shield System** is to help **${organizationName}** manage digital assets, identify cyber threats, and perform structured risk assessments based on industry standards.`
        }

        // 2. Identity, Capabilities & Advantages
        if (q.includes('who are you') || q.includes('identity') || q.includes('who is this')) {
            return "I am **ShieldBot**, your smart security assistant. I am designed to monitor the risk database in real-time and provide quick guidance on your system's security posture."
        }

        if (q.includes('advantage') || q.includes('benefit') || q.includes('feature') || q.includes('why use you')) {
            return "My key advantages include:\n1. **Speed**: Instant responses without API latency.\n2. **Privacy**: Data is never sent to external servers.\n3. **Accuracy**: Responses are based on real data in your database.\n4. **Availability**: Always active even without an internet connection."
        }

        if (q.includes('weakness') || q.includes('limit') || q.includes('disadvantage')) {
            return "As a Local AI, I have limitations in understanding very complex sentence contexts compared to Large Language Models (like Gemini). I am most effective when asked directly about risk data, projects, or methodology guidance."
        }

        if (q.includes('job') || q.includes('task') || q.includes('can you do')) {
            return "I can help you with:\n- **Risk List**: Type 'risk' to see the biggest threats.\n- **Project Status**: Type 'project' for assessment progress.\n- **User Stats**: Type 'user' for total user count.\n- **Health Check**: Type 'status' for a security summary."
        }

        // 3. User & Asset Statistics
        if (q.includes('user') || q.includes('total user') || q.includes('people')) {
            return `There are currently **${context.userCount} users** registered under the **${organizationName}** organization.`
        }

        if (q.includes('asset') || q.includes('item')) {
            if (!context.assets || context.assets.length === 0) {
                return "No information assets have been registered in your project database yet."
            }
            const assetList = context.assets.map((a: any) => `- **${a.name}** (${a.asset_type} | Crit: ${a.overall_criticality})`).join('\n')
            return `Here are the identified information assets:\n\n${assetList}`
        }

        // 4. Handling Risks & Threats
        if (q.includes('threat') || q.includes('actor') || q.includes('vector')) {
            if (!context.threats || context.threats.length === 0) {
                return "No threat scenarios have been recorded in the database yet."
            }
            const threatList = context.threats.map((t: any) => `- **${t.scenario_description}** (Actor: ${t.threat_actor_type})`).join('\n')
            return `Here are some monitored threat scenarios:\n\n${threatList}`
        }

        if (q.includes('risk') || q.includes('danger') || q.includes('problem')) {
            if (!context.topRisks || context.topRisks.length === 0) {
                return "The database shows no risks found. Great! Your system seems secure for now."
            }

            let filteredRisks = context.topRisks;
            let header = "Here are the **top 10 risks** detected:";

            if (q.includes('not finished') || q.includes('open') || q.includes('active') || q.includes('belum selesai')) {
                filteredRisks = context.topRisks.filter((r: any) => r.status !== 'closed' && r.status !== 'resolved');
                header = "Here are the **active/unresolved** risks:";
            }

            if (filteredRisks.length === 0) return "All detected risks have been resolved.";

            const riskList = filteredRisks.map((r: any) => `| ${r.risk_score} | **${r.risk_title}** | ${r.risk_level} |`).join('\n')
            return `${header}\n\n| Score | Risk Title | Level |\n| :--- | :--- | :--- |\n${riskList}`
        }

        // 5. Mitigations & Findings
        if (q.includes('mitigation') || q.includes('plan') || q.includes('solve')) {
            if (!context.mitigations || context.mitigations.length === 0) {
                return "No active mitigation plans found in the database."
            }
            const mitList = context.mitigations.map((m: any) => `- **${m.mitigation_description}** [${m.status}] (Prio: ${m.priority})`).join('\n')
            return `Here is the status of your mitigation plans:\n\n${mitList}`
        }

        if (q.includes('finding') || q.includes('audit') || q.includes('gap')) {
            if (!context.recentFindings || context.recentFindings.length === 0) {
                return "No recent audit findings recorded."
            }
            const findList = context.recentFindings.map((f: any) => `- **${f.issue}** (Severity: ${f.severity})`).join('\n')
            return `Recent Audit Findings:\n\n${findList}`
        }

        // 6. Handling Projects
        if (q.includes('project') || q.includes('assessment')) {
            if (!context.projects || context.projects.length === 0) {
                return "There are currently no assessment projects registered in the database."
            }
            const projectList = context.projects.map((p: any) => `- **${p.name}** [${p.isActive ? 'ACTIVE' : 'INACTIVE'}]`).join('\n')
            return `Found a total of **${context.projectCount} projects** (${context.activeProjectCount} active):\n\n${projectList}`
        }

        // 7. Handling Status / Security
        if (q.includes('status') || q.includes('security') || q.includes('condition') || q.includes('health')) {
            const highRisks = context.topRisks?.filter((r: any) => r.risk_level === 'critical' || r.risk_level === 'high').length || 0
            const statusLabel = highRisks > 3 ? "ACTION REQUIRED" : "STABLE";
            return `### System Security: **${statusLabel}**\n- **Projects:** ${context.activeProjectCount} Active / ${context.projectCount} Total\n- **Monitored Assets:** ${context.assets?.length || 0}\n- **Threat Scenarios:** ${context.threats?.length || 0}\n- **Critical/High Risks:** ${highRisks}\n- **User:** ${context.userCount} Registered\n- **Sync:** Database Connected`
        }

        // 8. Role / Access
        if (q.includes('role') || q.includes('access') || q.includes('permission')) {
            return "This system supports **Admin**, **Manager**, and **Auditor** roles. Each has different access permissions to ensure the integrity of risk assessment data."
        }

        // 9. Greetings
        if (q.includes('hello') || q.includes('hi') || q.includes('good morning') || q.includes('halo')) {
            return `Hello! ShieldBot is ready to help. Is there anything I can assist you with regarding security data today?`
        }

        return "I'm sorry, as a Local AI I don't recognize that question yet. However, I am an expert in answering about **risks**, **projects**, **OCTAVE**, and **system status**."
    }

    const handleSendMessage = () => {
        if (!input.trim() || isLoading) return
        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: processLocalResponse(userMessage) }])
            setIsLoading(false)
        }, 400)
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col"
                    >
                        {/* Minimalist Header */}
                        <div className="p-4 bg-white border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">ShieldBot</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500" /> Local Engine
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl hover:bg-slate-50">
                                <X className="w-4 h-4 text-slate-400" />
                            </Button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm ${m.role === 'user'
                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                        : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100/50'
                                        }`}>
                                        <div className="prose prose-sm prose-slate max-w-none 
                      prose-p:leading-relaxed prose-p:mb-0
                      prose-strong:text-slate-900 prose-strong:font-bold
                      prose-table:border prose-table:rounded-lg prose-table:my-2
                      prose-th:px-2 prose-th:py-1 prose-th:bg-slate-100/50
                      prose-td:px-2 prose-td:py-1">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-50 rounded-[20px] rounded-tl-none px-4 py-3 flex items-center gap-2">
                                        <MoreHorizontal className="w-4 h-4 text-slate-300 animate-pulse" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                    onClick={() => { setInput('What are my top risks?'); }}
                                    className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Top Risks
                                </button>
                                <button
                                    onClick={() => { setInput('Project status?'); }}
                                    className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Project Status
                                </button>
                            </div>

                            <div className="flex items-end gap-2">
                                <Textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                                    placeholder="Ask anything..."
                                    className="flex-1 min-h-[44px] max-h-[120px] bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-200 rounded-[18px] text-sm resize-none py-2.5 px-4 shadow-inner"
                                />
                                <Button
                                    size="icon"
                                    className="shrink-0 rounded-[18px] bg-slate-900 hover:bg-slate-800 transition-all w-11 h-11"
                                    disabled={!input.trim() || isLoading}
                                    onClick={handleSendMessage}
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </Button>
                            </div>
                            <p className="text-[9px] text-center text-slate-300 mt-3 font-bold uppercase tracking-widest">
                                Protected by Risk Shield Local Engine
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button & Rotating Tooltip */}
            <div className="relative">
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10, x: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10, x: -20 }}
                            key={tooltipIndex}
                            className="absolute bottom-[70px] right-0 whitespace-nowrap bg-slate-900 text-white text-[12px] font-bold py-2 px-4 rounded-2xl shadow-xl border border-slate-800"
                        >
                            {tooltips[tooltipIndex]}
                            {/* Little triangle arrow */}
                            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-800" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-[22px] bg-slate-900 text-white shadow-2xl flex items-center justify-center transition-all hover:bg-slate-800 relative z-10"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </motion.button>
            </div>
        </div>
    )
}
