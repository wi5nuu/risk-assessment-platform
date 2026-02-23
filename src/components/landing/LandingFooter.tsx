"use client"

import React from 'react'
import Link from 'next/link'
import { Shield, Github, Twitter, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingFooter() {
    return (
        <footer className="bg-background border-t py-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-6">
                            <Shield className="w-6 h-6" />
                            <span>Risk Shield System</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Proactive GRC platform for modern organizations. Built to solve the complexity of cyber risk management.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="#methodology" className="hover:text-primary transition-colors">Methodology</Link></li>
                            <li><Link href="/audit" className="hover:text-primary transition-colors">Audit Module</Link></li>
                            <li><Link href="/ai-advisor" className="hover:text-primary transition-colors">AI Advisor</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">API Reference</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Connect</h4>
                        <div className="flex gap-4 mb-6">
                            <Link href="#" className="p-2 bg-muted rounded-lg hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="p-2 bg-muted rounded-lg hover:text-primary transition-colors"><Github className="w-5 h-5" /></Link>
                            <Link href="#" className="p-2 bg-muted rounded-lg hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        </div>
                        <p className="text-xs text-muted-foreground">© 2026 Risk Shield System. All rights reserved.</p>
                    </div>
                </div>

                <div className="pt-8 border-t text-center">
                    <p className="text-xs text-muted-foreground">
                        Designed with excellence for the security community. Built using Next.js, Supabase, and Tailwind CSS.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export function CTASection() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your <br /> security posture?</h2>
                    <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                        Join hundreds of security professionals using Risk Shield System to simplify their compliance and risk assessments.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <Link href="/auth/register" className="w-full sm:w-auto">
                            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold w-full sm:w-auto">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/auth/login" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold w-full sm:w-auto bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
