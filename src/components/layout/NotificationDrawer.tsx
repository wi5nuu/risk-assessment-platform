"use client"

import React, { useState, useEffect } from 'react'
import {
    Bell,
    X,
    CheckCircle2,
    AlertTriangle,
    Info,
    Database,
    Shield,
    Folder,
    Clock,
    ArrowRight,
    Ghost
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    category: string
    is_read: boolean
    created_at: string
}

const FALLBACK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Welcome to Risk Shield Elite',
        message: 'Welcome to the platform! I am your AI assistant, ready to help you manage your organization\'s risk posture.',
        type: 'success',
        category: 'system',
        is_read: false,
        created_at: new Date(Date.now() - 60000).toISOString()
    },
    {
        id: '2',
        title: 'Critical: High Risk Detected',
        message: 'An Existential Operational Threat was detected in the latest audit. Risk Score: 25.',
        type: 'error',
        category: 'security',
        is_read: false,
        created_at: new Date(Date.now() - 300000).toISOString()
    },
    {
        id: '3',
        title: 'Database Backup Successful',
        message: 'Daily automated backup of the Risk Register for "President University" completed.',
        type: 'success',
        category: 'database',
        is_read: true,
        created_at: new Date(Date.now() - 900000).toISOString()
    },
    {
        id: '4',
        title: 'New Audit Project Created',
        message: 'Auditor Chris started a new assessment: "Data Privacy Q1 2026".',
        type: 'info',
        category: 'project',
        is_read: false,
        created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: '5',
        title: 'Warning: Failed Login Attempt',
        message: 'Three failed login attempts were detected from an unrecognized IP in Indonesia.',
        type: 'warning',
        category: 'security',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: '6',
        title: 'Organization Profile Updated',
        message: 'Admin Wisnu updated the organization contact details and security policy.',
        type: 'info',
        category: 'system',
        is_read: true,
        created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: '7',
        title: 'AI Security Advisor Updated',
        message: 'The AI model has been updated with the latest OCTAVE Allegro threat patterns.',
        type: 'success',
        category: 'system',
        is_read: false,
        created_at: new Date(Date.now() - 14400000).toISOString()
    },
    {
        id: '8',
        title: 'System Maintenance Notice',
        message: 'Scheduled server maintenance tomorrow at 02:00 UTC. Expect 5 mins of downtime.',
        type: 'info',
        category: 'system',
        is_read: false,
        created_at: new Date(Date.now() - 21600000).toISOString()
    },
    {
        id: '9',
        title: 'Database Index Optimized',
        message: 'System automatically optimized performance for the large Risk Register table.',
        type: 'success',
        category: 'database',
        is_read: true,
        created_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
        id: '10',
        title: 'Project Report Exported',
        message: 'The "Annual Security Audit" report was exported in XLSX format by Chris.',
        type: 'info',
        category: 'project',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
    }
]

interface NotificationDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    const fetchNotifications = async () => {
        setIsLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (!error && data && data.length > 0) {
            setNotifications(data)
        } else {
            // Use fallback if DB is empty or error
            setNotifications(FALLBACK_NOTIFICATIONS)
        }
        setIsLoading(false)
    }

    const markAsRead = async (id: string) => {
        const supabase = createClient()
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n) as Notification[])
    }

    const getIcon = (type: string, category: string) => {
        if (category === 'database') return <Database className="w-4 h-4" />
        if (category === 'security') return <Shield className="w-4 h-4" />
        if (category === 'project') return <Folder className="w-4 h-4" />

        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4" />
            case 'warning': return <AlertTriangle className="w-4 h-4" />
            case 'error': return <AlertTriangle className="w-4 h-4" />
            default: return <Info className="w-4 h-4" />
        }
    }

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'error': return 'bg-red-50 text-red-600 border-red-100'
            default: return 'bg-blue-50 text-blue-600 border-blue-100'
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[998]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[999] border-l border-slate-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-900">Notifications</h2>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Real-time System Pulse</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoading ? (
                                <div className="py-20 text-center">
                                    <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing Feed...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all hover:bg-slate-50 relative group",
                                            n.is_read ? "border-slate-100 bg-white" : "border-primary/10 bg-primary/5 shadow-sm"
                                        )}
                                    >
                                        {!n.is_read && (
                                            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full" />
                                        )}
                                        <div className="flex gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm",
                                                getTypeStyles(n.type)
                                            )}>
                                                {getIcon(n.type, n.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-slate-900 truncate pr-4">{n.title}</h4>
                                                <p className="text-[11px] text-slate-500 leading-snug mt-1">{n.message}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {n.category}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(n.created_at), 'HH:mm')}
                                                    </div>
                                                </div>

                                                {!n.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="mt-3 text-[9px] font-bold text-primary hover:underline"
                                                    >
                                                        Mark as Read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-40">
                                    <Ghost className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zero Alerts Detected</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                            <Link
                                href="/notifications"
                                onClick={onClose}
                                className="w-full py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                            >
                                View All Activity
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
