"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Menu, X, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Methodology', href: '#methodology' },
        { name: 'Journey', href: '#journey' },
        { name: 'FAQ', href: '#faq' },
    ]

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
            isScrolled ? "py-3 bg-background/20 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "py-6 bg-transparent"
        )}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-2 font-bold text-2xl">
                    <div className="relative">
                        <Shield className="w-8 h-8 text-primary transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                    </div>
                    <span className="tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Risk Shield System</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-xs font-bold tracking-widest uppercase text-muted-foreground/70 hover:text-primary transition-all duration-300 relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                    <div className="flex items-center gap-3 pl-6 border-l border-foreground/10">
                        <div className="relative group/login">
                            <Link href="/auth/login">
                                <Button variant="ghost" className="font-bold flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Member Login
                                </Button>
                            </Link>
                            {/* Info Card on Hover */}
                            {/* Simplified Info Card */}
                            <div className="absolute top-full right-0 mt-3 w-60 bg-background/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/login:opacity-100 group-hover/login:translate-y-0 group-hover/login:pointer-events-auto transition-all duration-300 z-[60]">
                                <div className="absolute -top-4 left-0 right-0 h-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Secure Member Access
                                </h4>
                                <ul className="text-[10px] font-medium text-muted-foreground space-y-2">
                                    <li className="flex items-center gap-2">
                                        Advanced Risk Data & Analytics
                                    </li>
                                    <li className="flex items-center gap-2">
                                        Audit Evidence Vault access
                                    </li>
                                </ul>
                                <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-muted-foreground italic">
                                    Authorized personnel only.
                                </div>
                            </div>
                        </div>
                        <Link href="/auth/register">
                            <Button className="font-bold px-6 shadow-lg shadow-primary/25 border-b-4 border-primary/20 hover:border-b-0 hover:translate-y-[2px] transition-all">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground bg-white/5 rounded-full border border-white/10"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-[100%] left-4 right-4 bg-background/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 mt-4 flex flex-col gap-6 shadow-2xl animate-in zoom-in-95 duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-xl font-black tracking-tight text-foreground border-b border-white/5 pb-2 hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-4 mt-4">
                        <Link href="/auth/login" className="w-full">
                            <Button variant="outline" className="w-full h-10 text-sm font-bold">Login</Button>
                        </Link>
                        <Link href="/auth/register" className="w-full">
                            <Button className="w-full h-10 text-sm font-bold">Launch Platform</Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
