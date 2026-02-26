"use client"

import React, { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Shield, Bell, User, Settings, Sparkles, Megaphone, Lightbulb, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { firstName, lastName, email, organizationName, role, avatarUrl } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    useEffect(() => {
        const welcome = sessionStorage.getItem('login_welcome')
        if (welcome) {
            toast(welcome, {
                icon: <Sparkles className="w-4 h-4 text-amber-500" />,
                description: "Your account security is our priority.",
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
                            <h2 className="text-sm font-semibold truncate max-w-[150px] sm:max-w-none">{organizationName || 'Risk Shield System'}</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{role || 'User'} Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {role === 'admin' && (
                            <Link href="/admin/security" className="p-2 hover:bg-muted rounded-full relative group/security" title="Security Command Center">
                                <Shield className="w-5 h-5 text-primary" />
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 text-white text-[10px] font-bold p-2 rounded shadow-xl opacity-0 group-hover/security:opacity-100 transition-opacity pointer-events-none z-50">
                                    ELITE SECURITY ACTIVE: Monitor System Integrity
                                </div>
                            </Link>
                        )}

                        <div className="relative group/notif">
                            <button className="p-2 hover:bg-muted rounded-full relative">
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                            </button>
                            {/* Smart Updates Popover */}
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 translate-y-2 pointer-events-none group-hover/notif:opacity-100 group-hover/notif:translate-y-0 group-hover/notif:pointer-events-auto transition-all duration-300 z-50 p-4">
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
                                            <p className="text-[11px] font-bold text-slate-800">Pro Tip</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">Use the OCTAVE Allegro Methodology for more accurate risk assessment results.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Megaphone className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-800">Feature Update</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">Report export now supports Word and Excel formats for high flexibility.</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 py-2 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/10">
                                    View All Notifications
                                </button>
                            </div>
                        </div>

                        <div className="relative group/user">
                            <div className="flex items-center gap-3 pl-4 border-l hover:opacity-80 transition-opacity cursor-pointer">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900">{firstName} {lastName}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{email}</p>
                                </div>
                                <Avatar className="w-9 h-9 border-2 border-primary/20 shadow-sm">
                                    {avatarUrl && <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} className="object-cover" />}
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                        {firstName?.[0]}{lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* User Dropdown */}
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-300 z-50 p-2">
                                <Link href="/settings/profile" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                    <User className="w-4 h-4" />
                                    My Profile
                                </Link>
                                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
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
