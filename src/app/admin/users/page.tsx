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
import { Loader2, Users, UserPlus, ArrowLeft, Shield } from 'lucide-react'
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
        email: '', password: '', firstName: '', lastName: '', role: 'auditor' as string
    })

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
        if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
            toast.error('Please fill all fields')
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
                toast.success('User created successfully')
                setShowCreateDialog(false)
                setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'auditor' })
                loadUsers()
            } else {
                toast.error(data.error)
            }
        } catch { toast.error('Failed to create user') }
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
        } catch { toast.error('Failed to update') }
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
                            <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
                            <p className="text-muted-foreground text-sm">Create and manage access for your team.</p>
                        </div>
                    </div>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create New User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                                <DialogDescription>Enter details to add a new member to your organization.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input placeholder="John" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input placeholder="Doe" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input type="email" placeholder="john@example.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Initial Password</Label>
                                    <Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>System Role</Label>
                                    <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auditor">🕵️ Auditor</SelectItem>
                                            <SelectItem value="auditee">🏢 Auditee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateUser} disabled={isCreating} className="w-full">
                                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                    Finalize Creation
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-purple-50/50 border-purple-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-100 rounded-lg"><Shield className="w-5 h-5 text-purple-600" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Administrators</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50/50 border-blue-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'auditor').length}</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Security Auditors</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 border-green-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'auditee').length}</p>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Project Owners</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b">
                        <CardTitle className="text-lg">User Directory</CardTitle>
                        <CardDescription>Click on a user to modify their role or status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {users.map(user => (
                                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                                            user.is_active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                                        )}>
                                            {user.first_name[0]}{user.last_name[0]}
                                        </div>
                                        <div>
                                            <p className={cn("font-bold text-base", !user.is_active && "text-muted-foreground line-through")}>
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 ml-16 sm:ml-0">
                                        <Badge className={cn("px-3 py-1 border", roleColor(user.role))}>
                                            {user.role === 'admin' ? '👑 Admin' : user.role === 'auditor' ? '🕵️ Auditor' : '🏢 Auditee'}
                                        </Badge>

                                        {user.user_id !== auth.userId && (
                                            <div className="flex items-center gap-2">
                                                <Select value={user.role} onValueChange={v => handleUpdateRole(user.id, v)}>
                                                    <SelectTrigger className="w-[110px] h-9"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="auditor">Auditor</SelectItem>
                                                        <SelectItem value="auditee">Auditee</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant={user.is_active ? "outline" : "default"}
                                                    size="sm"
                                                    className="h-9 px-3"
                                                    onClick={() => handleToggleActive(user.id, user.is_active)}
                                                >
                                                    {user.is_active ? 'Suspend' : 'Reactive'}
                                                </Button>
                                            </div>
                                        )}
                                        {user.user_id === auth.userId && (
                                            <span className="text-xs font-medium text-muted-foreground italic px-2">You (Current User)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-muted-foreground">No accounts found in your organization.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
