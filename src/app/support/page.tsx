"use client"

import React from 'react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingBackground } from '@/components/landing/LandingBackground'
import { HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SupportPage() {
    return (
        <div className="relative min-h-screen flex flex-col pt-32">
            <LandingBackground />
            <LandingHeader />

            <main className="flex-1 container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-6xl font-black mb-6">Support Center</h1>
                        <p className="text-xl text-muted-foreground">Expert assistance for your GRC and cybersecurity needs.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Email Support', info: 'support@riskshield.myid', icon: Mail },
                            { title: 'Community', info: 'Join our Discord', icon: MessageSquare },
                            { title: 'Enterprise', info: '24/7 Priority Line', icon: Phone },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-primary font-black uppercase tracking-widest">{item.info}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-12">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            Submit a Ticket
                        </h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</label>
                                    <input className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 focus:ring-1 ring-primary outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Organization</label>
                                    <input className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 focus:ring-1 ring-primary outline-none transition-all" placeholder="CyberSec Inc." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message</label>
                                <textarea rows={4} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 focus:ring-1 ring-primary outline-none transition-all" placeholder="How can we help?" />
                            </div>
                            <button className="w-full py-4 bg-primary text-white font-black rounded-xl hover:shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] transition-all">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}
