"use client"

import React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ShieldCheck, PlayCircle, Layers, ClipboardCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const stats = [
    { label: '100% Offline AI', desc: 'Secure local processing', icon: ShieldCheck },
    { label: '8-Step Framework', desc: 'OCTAVE Allegro Native', icon: Layers },
    { label: 'ISO 27001 Ready', desc: 'Pre-mapped controls', icon: ClipboardCheck },
    { label: 'Instant Reports', desc: 'One-click PDF Export', icon: Zap }
]

export function HeroSection() {
    const [activeIndex, setActiveIndex] = React.useState(0)

    React.useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % stats.length)
        }, 3500)
        return () => clearInterval(timer)
    }, [])
    return (
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Left Content (Text & Buttons) */}
                    <div className="lg:w-3/5 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest mb-10 shadow-2xl"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>OCTAVE Allegro GRC Framework</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl md:text-6xl lg:text-[4.5rem] font-[900] leading-[1.1] md:leading-[1] tracking-tighter mb-6 bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent"
                        >
                            Strategic Risk Intelligence. <br />
                            <span className="italic font-serif text-primary">Adaptive GRC Governance.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-base md:text-xl lg:text-2xl text-muted-foreground/80 max-w-2xl mx-auto lg:mx-0 mb-12 font-medium leading-relaxed"
                        >
                            Empower your organization with the 8-step OCTAVE Allegro methodology. We transform complex cybersecurity threats into actionable strategic insights through automated controls and evidence-based reporting.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6"
                        >
                            <Link href="/auth/register" className="w-full sm:w-auto">
                                <Button size="lg" className="h-10 md:h-14 px-6 md:px-8 text-xs md:text-base font-black w-full sm:w-auto shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all duration-300 rounded-xl md:rounded-2xl">
                                    Elite Access
                                    <ArrowRight className="ml-2 w-3.5 h-3.5 md:w-5 md:h-5" />
                                </Button>
                            </Link>
                            <Link href="#features" className="w-full sm:w-auto">
                                <Button size="lg" variant="ghost" className="h-10 md:h-14 px-6 md:px-8 text-xs md:text-base font-bold w-full sm:w-auto group rounded-xl md:rounded-2xl">
                                    <PlayCircle className="mr-2 w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
                                    System Demo
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Content (Floating Stats & Compliance) */}
                    <div className="lg:w-2/5 w-full">
                        <div className="relative group p-4 md:p-8 min-h-[300px] flex flex-col justify-center">
                            {/* Accent Glow behind features */}
                            <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-20 -z-10" />

                            {/* Feature Carousel Container */}
                            <div className="relative min-h-[160px] md:min-h-[140px] flex items-center justify-center lg:justify-start">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.6, ease: "anticipate" }}
                                        className="flex flex-col lg:flex-row items-center gap-4 md:gap-6 p-5 md:p-6 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-default group w-full lg:w-auto"
                                    >
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl shrink-0">
                                            {React.createElement(stats[activeIndex].icon, { className: "w-6 h-6 md:w-8 md:h-8 text-primary" })}
                                        </div>
                                        <div className="text-center lg:text-left">
                                            <div className="text-base md:text-xl font-black tracking-tight mb-1 text-foreground uppercase">
                                                {stats[activeIndex].label}
                                            </div>
                                            <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] leading-tight">
                                                {stats[activeIndex].desc}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Carousel Indicators */}
                            <div className="flex justify-center lg:justify-start gap-2 mt-8">
                                {stats.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1 transition-all duration-500 rounded-full",
                                            i === activeIndex ? "w-8 bg-primary" : "w-2 bg-white/10"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

                            {/* Standards Labels - Floating below */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4">
                                {['ISO 27001', 'NIST Framework', 'GDPR', 'UU PDP INDONESIA'].map((text, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0.2 }}
                                        animate={{ opacity: 0.4 }}
                                        whileHover={{ opacity: 1 }}
                                        className="text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase whitespace-nowrap transition-opacity border-b border-white/5 pb-1"
                                    >
                                        {text}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
