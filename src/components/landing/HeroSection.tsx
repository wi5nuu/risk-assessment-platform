"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, PlayCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HeroSection() {
    return (
        <section className="relative pt-36 pb-20 md:pt-60 md:pb-40 overflow-hidden">
            <div className="container mx-auto px-6 text-center">
                {/* Floating Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-widest mb-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Next-Gen NIST Baseline</span>
                </div>

                {/* Massive Typography */}
                <h1 className="text-6xl md:text-[5.5rem] font-[900] leading-[1] tracking-tighter mb-8 bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Master Cyber Risk. <br />
                    <span className="italic font-serif text-primary">With AI Precision.</span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    The ultra-modern GRC platform weaponizing data & AI to transform your compliance from a burden into a competitive advantage.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <Link href="/auth/register" className="w-full sm:w-auto">
                        <Button size="lg" className="h-16 px-10 text-xl font-black w-full sm:w-auto shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all duration-300 rounded-2xl">
                            Elite Access
                            <ArrowRight className="ml-3 w-6 h-6" />
                        </Button>
                    </Link>
                    <Link href="#features" className="w-full sm:w-auto">
                        <Button size="lg" variant="ghost" className="h-16 px-10 text-xl font-bold w-full sm:w-auto group rounded-2xl">
                            <PlayCircle className="mr-3 w-6 h-6 text-primary" />
                            System Demo
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Mockup Shadow / Teaser */}
                <div className="mt-32 relative max-w-6xl mx-auto group perspective-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                    <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-3xl p-4 shadow-2xl skew-y-1 group-hover:skew-y-0 transition-transform duration-1000 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 px-4 pt-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-orange-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="aspect-[16/9] bg-black/40 rounded-xl relative overflow-hidden flex border border-white/5">
                            {/* Dashboard Sidebar */}
                            <div className="w-16 md:w-48 border-r border-white/5 bg-white/5 p-4 hidden md:flex flex-col gap-6">
                                <div className="h-8 w-8 bg-primary/20 rounded-lg" />
                                <div className="space-y-3 flex-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-2 w-full bg-white/5 rounded-full" />
                                    ))}
                                </div>
                                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/5">
                                    <div className="w-6 h-6 rounded-full bg-primary/20" />
                                    <div className="h-2 w-16 bg-white/10 rounded-full" />
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 p-6 overflow-hidden">
                                {/* Header KPI Row */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl group/kpi hover:bg-primary/15 transition-colors">
                                        <div className="text-[10px] font-black text-primary uppercase mb-1 tracking-widest">Risk Index</div>
                                        <div className="text-2xl font-black">74.2%</div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl group/kpi hover:bg-white/10 transition-colors">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase mb-1 tracking-widest">Active Audits</div>
                                        <div className="text-2xl font-black">12</div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl group/kpi hover:bg-white/10 transition-colors">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase mb-1 tracking-widest">Compliance</div>
                                        <div className="text-2xl font-black">88%</div>
                                    </div>
                                </div>

                                {/* Risk Matrix Visual */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-48 relative overflow-hidden group/chart hover:border-primary/20 transition-all">
                                        <div className="text-[10px] font-bold uppercase text-muted-foreground mb-4 opacity-50">Risk Heatmap</div>
                                        <div className="grid grid-cols-4 grid-rows-4 gap-2 h-32">
                                            {[...Array(16)].map((_, i) => (
                                                <div key={i} className={cn(
                                                    "rounded-[4px] transition-all duration-500",
                                                    i < 2 ? "bg-red-500/40" : i < 6 ? "bg-orange-500/40" : "bg-green-500/20"
                                                )} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-48 space-y-3 group/ai hover:border-primary/20 transition-all">
                                        <div className="text-[10px] font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2 opacity-50">
                                            <ShieldCheck className="w-3 h-3 text-primary" />
                                            AI Intelligence
                                        </div>
                                        <div className="h-1.5 bg-primary/30 rounded-full w-[85%] animate-pulse" />
                                        <div className="h-1.5 bg-white/10 rounded-full w-full" />
                                        <div className="h-1.5 bg-white/10 rounded-full w-[60%]" />
                                        <div className="mt-4 p-2 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                                            <div className="text-[9px] font-bold text-primary italic">OPTIMIZING ASSETS...</div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fade Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
