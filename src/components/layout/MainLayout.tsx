"use client"

import React, { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Shield, Bell, User, Settings, Sparkles, Megaphone, Lightbulb, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FloatingAIWidget } from './FloatingAIWidget'
import { motion } from 'framer-motion'
import { NotificationDrawer } from './NotificationDrawer'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { firstName, lastName, email, organizationName, role, avatarUrl } = useAuth()
    const router = useRouter()
    const [context, setContext] = useState<any>(null)
    const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

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

        // Fetch context for marquee
        const fetchContext = async () => {
            try {
                const res = await fetch('/api/ai-context')
                if (res.ok) {
                    const data = await res.json()
                    setContext(data)
                }
            } catch (err) {
                console.error('Failed to fetch marquee context:', err)
            }
        }
        fetchContext()
        fetchUnreadCount()

        // Set up Supabase Realtime for Notifications
        const supabase = createClient()
        const channel = supabase
            .channel('realtime_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotif = payload.new as any
                    // Only show toast if it's for this user (simplification for this case)
                    // In a multi-user app, we'd check against profile.id
                    toast.message(newNotif.title, {
                        description: newNotif.message,
                        icon: newNotif.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Bell className="w-4 h-4 text-primary" />,
                        action: {
                            label: 'View',
                            onClick: () => setIsNotificationDrawerOpen(true)
                        }
                    })
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchUnreadCount = async () => {
        const supabase = createClient()
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)

        if (!error && count !== null) {
            setUnreadCount(count)
        }
    }

    const getMarqueeMessages = () => {
        const messages = [
            `Welcome back, ${role || 'User'} ${firstName}! Let's keep the system secure.`,
        ]

        if (context) {
            if (context.activeProjectCount > 0) {
                const projectText = context.activeProjectCount === 1 ? "1 active assessment project" : `${context.activeProjectCount} active assessment projects`
                messages.push(`Monitor Status: You have ${projectText} that need review.`)
            }
            if (context.topRisks?.length > 0) {
                const topRisk = context.topRisks[0]
                messages.push(`Alert - Top Risk: "${topRisk.risk_title}" detected with Score: ${topRisk.risk_score} (${topRisk.risk_level}).`)
            }
            if (context.userCount > 0) {
                messages.push(`Security Ops: Total of ${context.userCount} registered users across ${organizationName || 'your organization'}.`)
            }
            if (context.assets?.length > 0) {
                messages.push(`Asset Inventory: ${context.assets.length} critical assets currently being monitored.`)
            }
        }

        messages.push("Pro Tip: Use the OCTAVE Allegro Methodology for more accurate risk assessment results.")

        // Ensure we have 5 messages as requested
        while (messages.length < 5) {
            messages.push("Risk Shield System: Your trusted partner in cybersecurity risk management.")
        }

        return messages.slice(0, 5)
    }

    const marqueeMessages = getMarqueeMessages()

    return (
        <div className="flex min-h-screen bg-muted/30">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-[50] shadow-sm">
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

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationDrawerOpen(true)}
                                className="p-2 hover:bg-muted rounded-full relative"
                            >
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-background">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
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
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 translate-y-2 pointer-events-none group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:pointer-events-auto transition-all duration-300 z-[100] p-2">
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

                {/* Intelligence Stream Marquee */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center sticky top-16 z-20 shadow-sm">
                    {/* Label container - NO overflow-hidden here to allow popover to show */}
                    <div className="bg-primary px-4 h-full flex items-center gap-2 z-[50] shadow-[4px_0_10px_rgba(0,0,0,0.5)] cursor-help relative group/notif-label overflow-visible">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap">Intelligence Stream</span>

                        {/* Hover Tooltip / Notify Info - High Z-index and relative to Label */}
                        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-primary/40 p-3 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/notif-label:opacity-100 group-hover/notif-label:translate-y-0 transition-all duration-200 z-[100]">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">System Notification</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                "The Intelligence Stream provides real-time security alerts, project updates, and system integrity status. Monitor this feed for critical changes."
                            </p>
                        </div>
                    </div>

                    {/* Marquee container - overflow-hidden is ONLY here */}
                    <div className="flex-1 relative flex items-center h-full overflow-hidden z-[45]">
                        <motion.div
                            className="flex gap-20 whitespace-nowrap items-center px-8"
                            animate={{
                                x: [0, -2000],
                            }}
                            transition={{
                                duration: 60,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            {marqueeMessages.map((msg, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    {msg.includes('Alert') || msg.includes('Critical') ? (
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                    ) : (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    )}
                                    <span className="text-[11px] font-bold text-slate-300 tracking-wide">{msg}</span>
                                </div>
                            ))}
                            {/* Repeat for seamless loop */}
                            {marqueeMessages.map((msg, idx) => (
                                <div key={`loop-${idx}`} className="flex items-center gap-3">
                                    {msg.includes('Alert') || msg.includes('Critical') ? (
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                    ) : (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    )}
                                    <span className="text-[11px] font-bold text-slate-300 tracking-wide">{msg}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>

                <FloatingAIWidget />
                <NotificationDrawer
                    isOpen={isNotificationDrawerOpen}
                    onClose={() => {
                        setIsNotificationDrawerOpen(false)
                        fetchUnreadCount() // Refresh count when closing
                    }}
                />
            </div>
        </div>
    )
}
