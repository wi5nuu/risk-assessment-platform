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

                {/* Optimized Typography for Mobile */}
                <h1 className="text-4xl md:text-[5.5rem] font-[900] leading-[1.1] md:leading-[1] tracking-tighter mb-8 bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Master Cyber Risk. <br />
                    <span className="italic font-serif text-primary">With AI Precision.</span>
                </h1>

                <p className="text-lg md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    The ultra-modern GRC platform weaponizing data & AI to transform your compliance from a burden into a competitive advantage.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <Link href="/auth/register" className="w-full sm:w-auto">
                        <Button size="lg" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl font-black w-full sm:w-auto shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all duration-300 rounded-2xl">
                            Elite Access
                            <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6" />
                        </Button>
                    </Link>
                    <Link href="#features" className="w-full sm:w-auto">
                        <Button size="lg" variant="ghost" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl font-bold w-full sm:w-auto group rounded-2xl">
                            <PlayCircle className="mr-3 w-5 h-5 md:w-6 md:h-6 text-primary" />
                            System Demo
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Image Mockup (Cleaned Up) */}
                <div className="mt-20 md:mt-32 relative max-w-5xl mx-auto group">
                    <div className="absolute -inset-4 bg-primary/20 blur-[100px] opacity-20 pointer-events-none" />
                    <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-background transition-transform duration-700 hover:scale-[1.01]">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500/30" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                            </div>
                            <div className="text-[10px] text-muted-foreground/50 font-mono tracking-widest pl-2">PLATFORM_SECURE_ACCESS</div>
                        </div>
                        <img
                            src="https://th.bing.com/th/id/OIP.THz8LOZajcoRM9dpIxcBWAHaFB?w=248&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3"
                            alt="Cyber GRC Dashboard"
                            className="w-full h-auto grayscale-[50%] hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </div>
                </div>
            </div>
        </section>
    )
}
