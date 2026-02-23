"use client"

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Sparkles, User, Bot, HelpCircle, ShieldCheck, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LANDING_AI_KNOWLEDGE, INITIAL_SUGGESTIONS, getTimeBasedGreeting } from '@/lib/ai/landing-knowledge'

export function LandingAI() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([])
    const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Set initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: 'ai',
                    content: `${getTimeBasedGreeting()} Saya adalah AI Assistant. Saya dioptimalkan untuk memandu Anda melalui metodologi OCTAVE Allegro dan strategi ketahanan siber organisasi. Area mana yang ingin Anda tinjau secara strategis?`
                }
            ])
        }
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    /**
     * Advanced Keyword Matcher with Word Boundaries & Scoring
     */
    const findBestMatch = (userInput: string) => {
        const query = userInput.toLowerCase().trim()

        let bestMatch = null
        let highestScore = 0

        for (const item of LANDING_AI_KNOWLEDGE) {
            let currentScore = 0

            for (const keyword of item.keywords) {
                const kw = keyword.toLowerCase()

                // 1. Exact match (Highly Weighted)
                if (query === kw) {
                    currentScore += 100
                }

                // 2. Word Boundary Match (Precise)
                // Use regex to ensure the keyword is matched as a full word, not part of s-hi-eld
                const regex = new RegExp(`\\b${kw}\\b`, 'i')
                if (regex.test(query)) {
                    currentScore += 50
                }

                // 3. Partial Match (Lower Priority)
                else if (query.includes(kw) && kw.length > 3) {
                    currentScore += 10
                }
            }

            if (currentScore > highestScore) {
                highestScore = currentScore
                bestMatch = item
            }
        }

        // Return match only if we found something significant
        return highestScore > 0 ? bestMatch : null
    }

    const handleSend = (text: string) => {
        if (!text.trim()) return

        const userText = text.trim()
        setMessages(prev => [...prev, { role: 'user', content: userText }])
        setInput('')
        setIsTyping(true)

        // Find match using advanced matcher
        setTimeout(() => {
            const match = findBestMatch(userText)

            const response = match
                ? match.answer
                : "Parameter input tidak spesifik. Saya memiliki keahlian dalam Metodologi OCTAVE, Tata Kelola GRC, dan Infrastruktur Keamanan. Area mana yang ingin Anda eksplorasi secara mendalam?"

            setMessages(prev => [...prev, { role: 'ai', content: response }])

            // Update suggestions
            if (match && match.suggestions) {
                setSuggestions(match.suggestions)
            } else {
                setSuggestions(INITIAL_SUGGESTIONS)
            }

            setIsTyping(false)
        }, 800)
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] no-print">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 w-[360px] sm:w-[420px] overflow-hidden flex flex-col mb-4"
                    >
                        {/* Premium Header */}
                        <div className="bg-gradient-to-br from-primary to-[#2a4365] p-7 text-white relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
                                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight uppercase">AI Assistant</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                        <p className="text-[10px] text-primary-foreground/70 font-black uppercase tracking-widest">Mission-Critical Security Shield</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl transition-all hover:rotate-90">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                        </div>

                        {/* Chat History */}
                        <div
                            ref={scrollRef}
                            className="h-[420px] overflow-y-auto p-6 space-y-6 bg-[#fcfdfe] no-scrollbar scroll-smooth"
                        >
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                    {m.role === 'ai' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mb-1">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] px-4 py-3 text-sm font-normal leading-relaxed ${m.role === 'user'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/10 rounded-2xl rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-2xl rounded-tl-none'
                                        }`}>
                                        <div className="whitespace-pre-wrap">
                                            {m.role === 'ai' ? (
                                                m.content.split(/(Risk Shield Security Advisor|Risk Shield Advisor|Risk Shield System)/g).map((part, i) => (
                                                    (part === 'Risk Shield Security Advisor' || part === 'Risk Shield Advisor' || part === 'Risk Shield System')
                                                        ? <span key={i} className="text-black font-black">{part}</span>
                                                        : part
                                                ))
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Footer */}
                        <div className="p-6 bg-white border-t border-slate-50 space-y-4">
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="whitespace-nowrap bg-slate-50 hover:bg-white hover:border-primary hover:text-primary text-slate-500 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border border-slate-100 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSend(input)}
                                    placeholder="Tanyakan tentang Keamanan..."
                                    className="w-full bg-slate-100/80 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-5 pr-14 py-4 text-sm font-normal transition-all outline-none placeholder:text-slate-400"
                                />
                                <button
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-xl shadow-xl shadow-primary/20 disabled:opacity-30 hover:scale-105 active:scale-95 transition-all group"
                                >
                                    <Send className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>
                            <p className="text-[9px] text-center text-slate-400 font-bold tracking-widest uppercase">Secured by Risk Shield Offline Engine</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        layoutId="ai-trigger"
                        onClick={() => setIsOpen(true)}
                        className="bg-primary text-white p-5 rounded-full shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] flex items-center gap-3 font-black uppercase tracking-wider relative group border-2 border-white/10"
                    >
                        <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
                        <span className="hidden group-hover:block pr-2 origin-left transition-all">Initialize AI</span>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-4 border-white animate-bounce" />
                    </motion.button>
                )}
            </AnimatePresence>
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
