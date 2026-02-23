"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Brain, Lightbulb, Send } from 'lucide-react'

interface AIAdvisorProps {
    projectId: string
}

interface Advice {
    title: string
    body: string
    priority: 'info' | 'warning' | 'critical'
}

const FormattedText = ({ text }: { text: string }) => {
    if (!text) return null

    // Split by double asterisks for bolding
    const parts = text.split(/(\*\*.*?\*\*)/g)

    return (
        <div className="whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>
                }
                return part
            })}
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
            const [risksRes, findingsRes, checklistRes] = await Promise.all([
                supabase.from('risks').select('*, risk_vulnerability_mapping(vulnerability_id, vulnerabilities(name, category))').eq('project_id', projectId).eq('is_active', true),
                supabase.from('audit_findings').select('*').eq('project_id', projectId),
                supabase.from('audit_checklists').select('*, audit_items(*)').eq('project_id', projectId).maybeSingle(),
            ])

            const risks = risksRes.data || []
            const findings = findingsRes.data || []
            const checklist = checklistRes.data
            const items = checklist?.audit_items || []

            const advice: Advice[] = []

            // Rule-based AI analysis (Module 10)

            // 1. High-risk analysis
            const criticalRisks = risks.filter((r: any) => r.risk_level === 'critical')
            const highRisks = risks.filter((r: any) => r.risk_level === 'high')
            if (criticalRisks.length > 0) {
                advice.push({
                    title: `🚨 ${criticalRisks.length} Critical Risk(s) Detected`,
                    body: `You have ${criticalRisks.length} critical risk(s): ${criticalRisks.map((r: any) => `"${r.risk_title}"`).join(', ')}. These require immediate mitigation. Consider implementing compensating controls and escalating to management.`,
                    priority: 'critical',
                })
            }
            if (highRisks.length > 0) {
                advice.push({
                    title: `⚠️ ${highRisks.length} High Risk(s) Need Attention`,
                    body: `High risks include: ${highRisks.map((r: any) => `"${r.risk_title}"`).join(', ')}. Develop mitigation plans with clear timelines.`,
                    priority: 'warning',
                })
            }

            // 2. Vulnerability concentration analysis
            const vulnCategories = new Map<string, number>()
            risks.forEach((r: any) => {
                r.risk_vulnerability_mapping?.forEach((m: any) => {
                    const cat = m.vulnerabilities?.category || 'Unknown'
                    vulnCategories.set(cat, (vulnCategories.get(cat) || 0) + 1)
                })
            })
            const topCategory = Array.from(vulnCategories.entries()).sort((a, b) => b[1] - a[1])[0]
            if (topCategory && topCategory[1] > 1) {
                advice.push({
                    title: `📊 Vulnerability Concentration: ${topCategory[0]}`,
                    body: `${topCategory[1]} risks are linked to "${topCategory[0]}" vulnerabilities. This category should be prioritized in your security hardening roadmap. Consider targeted training and automated scanning for this area.`,
                    priority: 'warning',
                })
            }

            // 3. Compliance gap analysis
            if (items.length > 0) {
                const nonCompliant = items.filter((i: any) => i.compliance_status === 'non_compliant')
                const unreviewed = items.filter((i: any) => !i.compliance_status)
                if (nonCompliant.length > 0) {
                    advice.push({
                        title: `❌ ${nonCompliant.length} Non-Compliant Control(s)`,
                        body: `The following controls are non-compliant: ${nonCompliant.slice(0, 3).map((i: any) => `"${i.control_title}"`).join(', ')}${nonCompliant.length > 3 ? ` and ${nonCompliant.length - 3} more` : ''}. Address these to improve your compliance score.`,
                        priority: 'critical',
                    })
                }
                if (unreviewed.length > 0) {
                    advice.push({
                        title: `📋 ${unreviewed.length} Unreviewed Control(s)`,
                        body: `You have ${unreviewed.length} controls that haven't been evaluated yet. Complete the audit checklist review to get an accurate compliance score.`,
                        priority: 'info',
                    })
                }
            } else {
                advice.push({
                    title: '💡 Start Your Security Audit',
                    body: 'No audit checklist has been created yet. Go to the "Control Checklist" tab to select a framework and generate your audit checklist.',
                    priority: 'info',
                })
            }

            // 4. Findings summary
            if (findings.length > 0) {
                const critFindings = findings.filter((f: any) => f.severity === 'critical')
                if (critFindings.length > 0) {
                    advice.push({
                        title: `🔴 ${critFindings.length} Critical Finding(s)`,
                        body: 'Critical findings require immediate remediation. Ensure each has an assigned owner and a target resolution date.',
                        priority: 'critical',
                    })
                }
            }

            // 5. General recommendations
            if (risks.length > 0 && risks.every((r: any) => !r.owner)) {
                advice.push({
                    title: '👤 Assign Risk Owners',
                    body: 'None of your risks have an assigned owner. Assign risk owners to ensure accountability and timely mitigation.',
                    priority: 'warning',
                })
            }

            if (advice.length === 0) {
                advice.push({
                    title: '✅ Looking Good!',
                    body: 'No major issues detected. Continue monitoring your risk landscape and maintaining your audit controls.',
                    priority: 'info',
                })
            }

            setAdviceList(advice)
        } catch (err) {
            toast.error('Analysis failed')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleQuestion = () => {
        if (!question.trim() || isThinking) return

        setIsThinking(true)
        const currentQuestion = question
        setQuestion('')
        setHasData(true) // Ensure view doesn't jump

        // Rule-based Q&A (Module 10 AI features)
        const q = currentQuestion.toLowerCase()
        let answer = ''

        if (q.includes('sql injection') || q.includes('injection')) {
            answer = `**What it is:** 
SQL Injection is a sneaky way for attackers to trick your website into revealing secrets it shouldn't, like member lists or private passwords, by "injecting" malicious code into parts of the site where users type information (like a login box).

**Business Impact:** 
For a university, this could mean student records (IP, grades, personal data) being stolen or deleted. This leads to massive legal fines, loss of trust from students and donors, and potential shutdown of digital services.

**Recommendation:** 
1. Use "Parameterized Queries" (it's like giving the website a template that can't be modified by users).
2. Regularly scan your software for these holes.
3. Train your development team on secure coding standards.`
        } else if (q.includes('xss') || q.includes('cross-site scripting')) {
            answer = `**What it is:** 
Cross-Site Scripting (XSS) is like a digital prank where an attacker puts a "booby-blocked" script on a page. When other students or staff visit that page, the script runs in their browser and could steal their login sessions.

**Business Impact:** 
Attackers can impersonate university administrators or staff, potentially modifying payroll, grades, or official announcements, causing administrative chaos and reputational damage.

**Recommendation:** 
1. "Output Encoding" - ensure the website treats user input as plain text, not code.
2. Implement a Content Security Policy (CSP).
3. Use modern web frameworks that stop this automatically.`
        } else if (q.includes('authentication') || q.includes('broken auth')) {
            answer = `**What it is:** 
Broken Authentication happens when the "digital locks" on your users' accounts are weak or broken, allowing attackers to guess passwords easily or bypass login screens altogether.

**Business Impact:** 
Massive unauthorized access to sensitive academic or financial systems. It can lead to systemic identity theft within the university population.

**Recommendation:** 
1. Enforce Multi-Factor Authentication (MFA/2FA) for everyone.
2. Implement strict password complexity rules.
3. Lock out accounts after a few failed attempts.`
        } else if (q.includes('ssrf') || q.includes('server-side request forgery')) {
            answer = `**What it is:** 
SSRF is where an attacker trick's the university's own server into attacking other computers inside the university network that are usually hidden from the public.

**Business Impact:** 
Confidential research data, internal emails, and financial spreadsheets that are "safely behind the firewall" could be accessed and stolen.

**Recommendation:** 
1. Only allow the server to talk to specific, trusted internet addresses (Whitelisting).
2. Segment your internal network so one server can't see everything.
3. Sanitize all web requests originating from user inputs.`
        } else if (q.includes('compliance') || q.includes('score')) {
            answer = 'Your compliance score is calculated as: **(Compliant × 1 + Partially Compliant × 0.5) / (Total − N/A) × 100**. Focus on converting "Non-Compliant" controls to "Compliant" status for the biggest impact on your official report.'
        } else if (q.includes('risk') && q.includes('score')) {
            answer = 'Risk Score = **Likelihood × Impact** (both on a 1-5 scale). \n- 1-4: Low (Monitor)\n- 5-9: Medium (Plan mitigation)\n- 10-14: High (Prioritize mitigation)\n- 15-25: Critical (Immediate Action required).'
        } else if (q.includes('mitigation') || q.includes('mitigate')) {
            answer = '**The four standard mitigation approaches are:** \n1. **Accept**: Acknowledge the risk and do nothing because it\'s too expensive to fix. \n2. **Mitigate**: Add security controls to make the risk smaller. \n3. **Transfer**: Like buying insurance or using a cloud provider who takes the risk for you. \n4. **Avoid**: Stop doing the activity that creates the risk entirely.'
        } else {
            answer = `I can help with structured explanations of vulnerabilities (SQL Injection, XSS, SSRF, etc.), compliance scoring rules, and risk mitigation strategies. Try asking: "Explain SQL Injection risk to management"`
        }

        // Simulate 3 seconds of thinking
        setTimeout(() => {
            setQaPairs(prev => [...prev, { q: currentQuestion, a: answer }])
            setIsThinking(false)
        }, 3000)
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
                                <div key={idx} className={`p-4 rounded-lg ${priorityColors[advice.priority]}`}>
                                    <h4 className="font-semibold text-sm">{advice.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{advice.body}</p>
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
                                <div className="bg-muted rounded-lg px-4 py-3 max-w-[85%] shadow-sm border border-border/50">
                                    <div className="text-sm leading-relaxed text-foreground">
                                        <FormattedText text={pair.a} />
                                    </div>
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

