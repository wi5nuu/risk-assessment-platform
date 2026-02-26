"use client"

import React, { useState, useEffect } from 'react'
import {
    Bell,
    Search,
    Filter,
    CheckCircle2,
    AlertTriangle,
    Info,
    Database,
    Shield,
    Folder,
    Clock,
    MoreVertical,
    Trash2,
    Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/MainLayout'

type NotificationCategory = 'all' | 'system' | 'project' | 'security' | 'database'

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    category: NotificationCategory
    is_read: boolean
    created_at: string
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [activeTab, setActiveTab] = useState<NotificationCategory>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        setIsLoading(true)
        const supabase = createClient()

        // Fetch real notifications
        const { data: realNotifs, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching notifications:', error)
            // Fallback to sample data if table doesn't exist yet or other error
            setNotifications(getSampleNotifications())
        } else if (realNotifs && realNotifs.length > 0) {
            setNotifications(realNotifs)
        } else {
            setNotifications(getSampleNotifications())
        }
        setIsLoading(false)
    }

    const getSampleNotifications = (): Notification[] => [
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

    const filteredNotifications = notifications.filter(n => {
        const matchesTab = activeTab === 'all' || n.category === activeTab
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    })

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
        <MainLayout>
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Risk Shield System</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Notification Center</h1>
                        <p className="text-slate-500 font-medium">Monitor system integrity, database updates, and project alerts.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true })) as Notification[])}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 border border-slate-200"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark all as read
                        </button>
                    </div>
                </div>

                {/* Filters Area */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 mb-8 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex p-1 bg-slate-50 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        {(['all', 'security', 'database', 'project', 'system'] as NotificationCategory[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeTab === tab
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                {/* List Area */}
                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {isLoading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-400 font-medium italic">Synchronizing Secure Feed...</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "group relative bg-white border rounded-3xl p-6 transition-all hover:shadow-md",
                                        notification.is_read ? "border-slate-100" : "border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]"
                                    )}
                                >
                                    {!notification.is_read && (
                                        <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    )}

                                    <div className="flex gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm",
                                            getTypeStyles(notification.type)
                                        )}>
                                            {getIcon(notification.type, notification.category)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={cn(
                                                    "font-bold text-slate-900 truncate pr-8",
                                                    notification.is_read ? "text-slate-700" : "text-slate-900"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 whitespace-nowrap">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(notification.created_at), 'HH:mm')}
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                                                        {notification.category}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(notification.created_at), 'dd MMM yyyy')}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="px-3 py-1 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                    <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-32 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Secure Inbox Empty</h3>
                                <p className="text-slate-400 max-w-xs mx-auto text-sm">No notifications found in this category. All clear!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </MainLayout>
    )
}
