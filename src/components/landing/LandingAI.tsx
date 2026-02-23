"use client"

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Sparkles, User, Bot, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LANDING_AI_KNOWLEDGE, INITIAL_SUGGESTIONS } from '@/lib/ai/landing-knowledge'

export function LandingAI() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Halo! Saya Asisten Virtual Risk Shield System. Ada yang bisa saya bantu jelaskan mengenai platform GRC ini?" }
    ])
    const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = (text: string) => {
        if (!text.trim()) return

        setMessages(prev => [...prev, { role: 'user', content: text }])
        setInput('')
        setIsTyping(true)

        // Find match in knowledge base
        setTimeout(() => {
            const query = text.toLowerCase()
            const match = LANDING_AI_KNOWLEDGE.find(k =>
                k.keywords.some(kw => query.includes(kw))
            )

            const response = match
                ? match.answer
                : "Maaf, saya belum memiliki informasi spesifik mengenai itu. Apakah Anda ingin menanyakan tentang Keunggulan, Tujuan, atau Manfaat platform?"

            setMessages(prev => [...prev, { role: 'ai', content: response }])

            // Update suggestions dynamically based on match
            if (match && match.suggestions) {
                setSuggestions(match.suggestions)
            } else {
                setSuggestions(INITIAL_SUGGESTIONS)
            }

            setIsTyping(false)
        }, 1000)
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] no-print">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[350px] sm:w-[400px] overflow-hidden flex flex-col mb-4"
                    >
                        {/* Header */}
                        <div className="bg-primary p-6 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-300" />
                                    Security Advisor
                                </h3>
                                <p className="text-xs text-primary-foreground/80 font-medium">Aktif untuk menjawab pertanyaan Anda</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10">
                                <X className="w-5 h-5" />
                            </button>
                            {/* Decorative Blobs */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        </div>

                        {/* Chat Body */}
                        <div
                            ref={scrollRef}
                            className="h-[400px] overflow-y-auto p-6 space-y-4 bg-slate-50/50 no-scrollbar"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium ${m.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none shadow-md'
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1 opacity-60 text-[10px] uppercase font-bold tracking-widest">
                                            {m.role === 'user' ? <><User className="w-3" /> Anda</> : <><Bot className="w-3" /> Advisor AI</>}
                                        </div>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-slate-400 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer & Suggestions */}
                        <div className="p-4 border-t bg-white">
                            <div
                                className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="whitespace-nowrap bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSend(input)}
                                    placeholder="Tanyakan sesuatu..."
                                    className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                                />
                                <button
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim()}
                                    className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        layoutId="ai-trigger"
                        onClick={() => setIsOpen(true)}
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-primary text-white p-5 rounded-full shadow-2xl shadow-primary/40 flex items-center gap-3 font-bold relative group"
                    >
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <span className="hidden group-hover:block pr-2 origin-left transition-all">Tanya Advisor</span>
                        {/* Notification Dot */}
                        <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-primary" />
                    </motion.button>
                )}
            </AnimatePresence>
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
