"use client"

import React from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Shield, Bell, User, Settings, Sparkles, Megaphone, Lightbulb } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { firstName, lastName, email, organizationName, role } = useAuth()

    React.useEffect(() => {
        const welcome = sessionStorage.getItem('login_welcome')
        if (welcome) {
            toast(welcome, {
                icon: <Sparkles className="w-4 h-4 text-amber-500" />,
                description: "Keamanan akun Anda adalah prioritas kami.",
                duration: 5000,
            })
            sessionStorage.removeItem('login_welcome')
        }
    }, [])

    return (
        <div className="flex min-h-screen bg-muted/30">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-2 md:gap-4">
                        <MobileNav />
                        <div>
                            <h2 className="text-sm font-semibold truncate max-w-[150px] sm:max-w-none">{organizationName || 'Assessment Platform'}</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{role} Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group/notif">
                            <button className="p-2 hover:bg-muted rounded-full relative">
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                            </button>
                            {/* Smart Updates Popover */}
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 translate-y-2 pointer-events-none group-hover/notif:opacity-100 group-hover/notif:translate-y-0 group-hover/notif:pointer-events-auto transition-all duration-300 z-50 p-4">
                                {/* Bridge to prevent hover loss */}
                                <div className="absolute -top-4 left-0 right-0 h-4" />
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Platform Updates</h3>
                                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Lightbulb className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-800">Tips Pro</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">Gunakan Metodologi OCTAVE Allegro untuk hasil risk assessment yang lebih akurat.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Megaphone className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-800">Update Fitur</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">Export laporan kini mendukung format Word dan Excel untuk fleksibilitas tinggi.</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 py-2 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/10">
                                    Lihat Semua Notifikasi
                                </button>
                            </div>
                        </div>
                        <Link href="/settings/profile" className="flex items-center gap-3 pl-4 border-l hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">{firstName} {lastName}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{email}</p>
                            </div>
                            <Avatar className="w-9 h-9 border-2 border-primary/20 shadow-sm">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                    {firstName?.[0]}{lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
