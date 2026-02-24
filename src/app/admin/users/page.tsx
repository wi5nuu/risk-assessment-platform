"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Users, UserPlus, ArrowLeft, Shield, Mail, CheckCircle2, Key, Eye, EyeOff, Copy, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { cn } from '@/lib/utils'

interface UserRow {
    id: string
    user_id: string
    first_name: string
    last_name: string
    email: string
    role: 'admin' | 'auditor' | 'auditee'
    is_active: boolean
    temp_password?: string | null
    created_at: string
}

export default function UsersManagementPage() {
    const router = useRouter()
    const auth = useAuth()
    const [users, setUsers] = useState<UserRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [newUser, setNewUser] = useState({
        email: '', password: '', firstName: '', lastName: '', role: 'auditor' as string,
        inviteOnly: true
    })
    const [resettingUser, setResettingUser] = useState<UserRow | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [isResetting, setIsResetting] = useState(false)
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)

    const togglePasswordVisibility = (userId: string) => {
        setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }))
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Password copied to clipboard')
    }

    useEffect(() => {
        if (!auth.isLoading) {
            if (!auth.isAdmin()) {
                router.push('/dashboard')
                return
            }
            loadUsers()
        }
    }, [auth.isLoading])

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (res.ok) setUsers(data.users || [])
            else toast.error(data.error)
        } catch { toast.error('Failed to load users') }
        finally { setIsLoading(false) }
    }

    const handleCreateUser = async () => {
        if (!newUser.email || (!newUser.password && !newUser.inviteOnly) || !newUser.firstName || !newUser.lastName) {
            toast.error('Please fill all required fields')
            return
        }
        setIsCreating(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(newUser.inviteOnly ? 'Invitation sent successfully' : 'User created successfully')
                setShowCreateDialog(false)
                setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'auditor', inviteOnly: true })
                loadUsers()
            } else {
                toast.error(data.error)
            }
        } catch { toast.error('Failed to process request') }
        finally { setIsCreating(false) }
    }

    const handleUpdateRole = async (profileId: string, role: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId, role }),
            })
            if (res.ok) {
                toast.success('Role updated')
                setUsers(prev => prev.map(u => u.id === profileId ? { ...u, role: role as any } : u))
            } else {
                const d = await res.json()
                toast.error(d.error)
            }
        } catch { toast.error('Failed to update role') }
    }

    const handleToggleActive = async (profileId: string, currentActive: boolean) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId, is_active: !currentActive }),
            })
            if (res.ok) {
                toast.success(currentActive ? 'User deactivated' : 'User activated')
                setUsers(prev => prev.map(u => u.id === profileId ? { ...u, is_active: !currentActive } : u))
            }
        } catch { toast.error('Failed to update status') }
    }

    const handleResetPassword = async () => {
        if (!resettingUser || !newPassword) return
        setIsResetting(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId: resettingUser.id, password: newPassword }),
            })
            if (res.ok) {
                toast.success('Password updated successfully')
                setUsers(prev => prev.map(u => u.id === resettingUser.id ? { ...u, temp_password: newPassword } : u))
                setResettingUser(null)
                setNewPassword('')
                setShowNewPassword(false)
                setShowCurrentPassword(false)
            } else {
                const d = await res.json()
                toast.error(d.error)
            }
        } catch { toast.error('Failed to update password') }
        finally { setIsResetting(false) }
    }

    const suggestPassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        let pass = ""
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setNewPassword(pass)
        setShowNewPassword(true)
        toast.info("Secure password suggested")
    }

    if (auth.isLoading || isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        )
    }

    const roleColor = (role: string) => {
        if (role === 'admin') return 'bg-purple-100 text-purple-800 border-purple-200'
        if (role === 'auditor') return 'bg-blue-100 text-blue-800 border-blue-200'
        return 'bg-green-100 text-green-800 border-green-200'
    }

    return (
        <MainLayout>
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Team Management</h1>
                            <p className="text-muted-foreground text-sm font-medium">Manage permissions and project access.</p>
                        </div>
                    </div>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto shadow-lg shadow-primary/20">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Team Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Add Team Member</DialogTitle>
                                <DialogDescription>Configure system access for a new member.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 py-4">
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            Invite via Email
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">Recommended for maximum security.</p>
                                    </div>
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            checked={newUser.inviteOnly}
                                            onChange={e => setNewUser({ ...newUser, inviteOnly: e.target.checked })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-black text-slate-400">First Name</Label>
                                        <Input placeholder="John" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-black text-slate-400">Last Name</Label>
                                        <Input placeholder="Doe" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} className="h-10" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-black text-slate-400">Email Address</Label>
                                    <Input type="email" placeholder="john@example.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="h-10" />
                                </div>

                                {!newUser.inviteOnly && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-black text-slate-400">Initial Password</Label>
                                        <Input type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="h-10" />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-black text-slate-400">Organization Role</Label>
                                    <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                                        <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auditor">🕵️ Security Auditor</SelectItem>
                                            <SelectItem value="auditee">🏢 Project Owner (Auditee)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateUser} disabled={isCreating} className="w-full h-11 font-black shadow-lg shadow-primary/20">
                                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    {newUser.inviteOnly ? 'SEND ACTIVATION LINK' : 'CREATE ACCOUNT NOW'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white ring-1 ring-purple-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500 rounded-2xl shadow-lg shadow-purple-200"><Shield className="w-6 h-6 text-white" /></div>
                                <div>
                                    <p className="text-3xl font-black">{users.filter(u => u.role === 'admin').length}</p>
                                    <p className="text-[10px] text-purple-600 uppercase font-black tracking-widest">Administrators</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white ring-1 ring-blue-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200"><Users className="w-6 h-6 text-white" /></div>
                                <div>
                                    <p className="text-3xl font-black">{users.filter(u => u.role === 'auditor').length}</p>
                                    <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest">Security Auditors</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white ring-1 ring-green-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500 rounded-2xl shadow-lg shadow-green-200"><Users className="w-6 h-6 text-white" /></div>
                                <div>
                                    <p className="text-3xl font-black">{users.filter(u => u.role === 'auditee').length}</p>
                                    <p className="text-[10px] text-green-600 uppercase font-black tracking-widest">Project Owners</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-xl overflow-hidden ring-1 ring-slate-200">
                    <CardHeader className="bg-slate-50 border-b py-6">
                        <CardTitle className="text-xl font-bold">User Directory</CardTitle>
                        <CardDescription className="text-sm font-medium">Manage identity, roles, and system health status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {users.map(user => (
                                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all",
                                            user.is_active ? "bg-primary text-primary-foreground shadow-md rotate-3" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {user.first_name[0]}{user.last_name[0]}
                                        </div>
                                        <div>
                                            <p className={cn("font-bold text-base tracking-tight", !user.is_active && "text-slate-400 line-through")}>
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-medium text-slate-400">{user.email}</p>
                                                {user.temp_password && (
                                                    <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
                                                        <span
                                                            className="text-xs font-mono bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                                            onClick={() => copyToClipboard(user.temp_password!)}
                                                            title="Click to copy password"
                                                        >
                                                            {showPasswords[user.id] ? user.temp_password : '••••••••'}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-400 hover:text-slate-600"
                                                            onClick={() => togglePasswordVisibility(user.id)}
                                                        >
                                                            {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 ml-16 sm:ml-0">
                                        <Badge className={cn("px-3 py-1 border-none shadow-sm font-black text-[10px] uppercase tracking-tighter", roleColor(user.role))}>
                                            {user.role === 'admin' ? '👑 Admin' : user.role === 'auditor' ? '🕵️ Auditor' : '🏢 Auditee'}
                                        </Badge>

                                        {user.user_id !== auth.userId && (
                                            <div className="flex items-center gap-2">
                                                <Select value={user.role} onValueChange={v => handleUpdateRole(user.id, v)}>
                                                    <SelectTrigger className="w-[110px] h-9 font-bold bg-white"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="auditor">Auditor</SelectItem>
                                                        <SelectItem value="auditee">Auditee</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant={user.is_active ? "outline" : "default"}
                                                    size="sm"
                                                    className={cn("h-9 px-4 font-bold border-2 transition-all", !user.is_active && "shadow-lg shadow-primary/20")}
                                                    onClick={() => handleToggleActive(user.id, user.is_active)}
                                                >
                                                    {user.is_active ? 'Suspend' : 'Reactive'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 px-3 border-2"
                                                    onClick={() => setResettingUser(user)}
                                                    title="Reset Password"
                                                >
                                                    <Key className="w-4 h-4 text-amber-500" />
                                                </Button>
                                            </div>
                                        )}
                                        {user.user_id === auth.userId && (
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Active You</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="text-center py-24">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed">
                                        <Users className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-900 font-bold italic">Identity vault is empty.</p>
                                    <p className="text-slate-400 text-sm">Add your team members to get started.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!resettingUser} onOpenChange={(open) => !open && setResettingUser(null)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Reset User Password</DialogTitle>
                            <DialogDescription>
                                Set a new password for {resettingUser?.first_name} {resettingUser?.last_name}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Account History: Current Password</label>
                                <div className="flex items-center justify-between">
                                    <code className="text-sm font-mono font-bold text-primary break-all">
                                        {resettingUser?.temp_password
                                            ? (showCurrentPassword ? resettingUser.temp_password : '••••••••••••')
                                            : 'NO PASSWORD STORED'
                                        }
                                    </code>
                                    {resettingUser?.temp_password && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-primary transition-colors shrink-0"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold underline decoration-primary/30 underline-offset-4">New secure password</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] font-black uppercase tracking-tighter text-primary hover:bg-primary/5 gap-1.5"
                                        onClick={suggestPassword}
                                    >
                                        <Wand2 className="w-3 h-3" />
                                        Suggest
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password..."
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pr-10 border-2 focus:border-primary transition-all font-mono"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        type="button"
                                    >
                                        {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setResettingUser(null)
                                setShowNewPassword(false)
                                setShowCurrentPassword(false)
                                setNewPassword('')
                            }}>Cancel</Button>
                            <Button
                                onClick={handleResetPassword}
                                disabled={isResetting || !newPassword}
                                className="font-bold bg-primary hover:bg-primary shadow-lg shadow-primary/20"
                            >
                                {isResetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Update Password
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    )
}
