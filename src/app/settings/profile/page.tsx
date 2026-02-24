"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Shield, Mail, Lock, Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, Key } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export default function ProfilePage() {
    const { email, firstName, lastName, role, tempPassword, profileId } = useAuth()
    const supabase = createClient() as any

    const [isUpdating, setIsUpdating] = useState(false)
    const [showReauth, setShowReauth] = useState(false)
    const [password, setPassword] = useState('')
    const [pendingAction, setPendingAction] = useState<'email' | 'password' | null>(null)

    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showReauthPass, setShowReauthPass] = useState(false)

    const handleActionStart = (action: 'email' | 'password') => {
        if (action === 'email' && !newEmail) {
            toast.error('Please enter a new email address')
            return
        }
        if (action === 'password') {
            if (newPassword.length < 6) {
                toast.error('Password must be at least 6 characters')
                return
            }
            if (newPassword !== confirmPassword) {
                toast.error('Passwords do not match')
                return
            }
        }

        setPendingAction(action)
        setShowReauth(true)
    }

    const handleReverifyAndExecute = async () => {
        if (!password) {
            toast.error('Current password is required')
            return
        }

        setIsUpdating(true)
        try {
            // Re-authenticate
            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: email!,
                password: password,
            })

            if (reauthError) {
                toast.error('Identity verification failed. Please check your password.')
                setIsUpdating(false)
                return
            }

            // Execute pending action
            if (pendingAction === 'email') {
                const { error: updateError } = await supabase.auth.updateUser({ email: newEmail })
                if (updateError) throw updateError
                toast.success('Confirmation email sent to both old and new addresses.')
            } else if (pendingAction === 'password') {
                const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
                if (updateError) throw updateError

                // ALSO UPDATE temp_password in user_profiles
                if (profileId) {
                    await supabase
                        .from('user_profiles')
                        .update({ temp_password: newPassword })
                        .eq('id', profileId)
                }

                toast.success('Password updated successfully.')
            }

            setShowReauth(false)
            setPassword('')
            setPendingAction(null)
            setNewEmail('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            toast.error(err.message || 'Update failed')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Security Settings</h1>
                    <p className="text-muted-foreground font-medium">Manage your identity and account security.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Public Profile */}
                    <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Account Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                                    {firstName?.[0]}{lastName?.[0]}
                                </div>
                                <div>
                                    <p className="text-xl font-black">{firstName} {lastName}</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary">{role} Account</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-black text-slate-400">Primary Email</Label>
                                <div className="flex items-center gap-2 text-slate-900 font-bold bg-slate-50 p-3 rounded-xl border">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {email}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden text-slate-900">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Security Credentials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Current Secure Password</label>
                                <div className="flex items-center justify-between">
                                    <code className="text-sm font-mono font-bold text-primary break-all">
                                        {tempPassword ? (showCurrent ? tempPassword : '••••••••••••') : 'NOT RECORDED'}
                                    </code>
                                    {tempPassword && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-primary transition-colors shrink-0"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label className="text-[10px] uppercase font-black text-slate-400">New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showNew ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-11 font-bold pr-10"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:bg-transparent"
                                        onClick={() => setShowNew(!showNew)}
                                    >
                                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-black text-slate-400">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-11 font-bold pr-10"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:bg-transparent"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button
                                className="w-full h-11 font-black shadow-lg shadow-primary/20"
                                onClick={() => handleActionStart('password')}
                            >
                                UPDATE SECURITY KEY
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sensitive Zone */}
                <Card className="border-none shadow-xl ring-1 ring-red-100 bg-red-50/20 overflow-hidden text-slate-900">
                    <CardHeader className="bg-red-50 border-b border-red-100">
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-5 h-5" />
                            Sensitive Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-black text-slate-400">Change Identification Email</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="new-email@organization.com"
                                        className="h-11 font-bold bg-white"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        className="h-11 px-6 border-2 font-black text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                        onClick={() => handleActionStart('email')}
                                    >
                                        CHANGE EMAIL
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">Changing your email will require multiple factor verification and may temporarily lock your access.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Re-auth Dialog */}
                <Dialog open={showReauth} onOpenChange={setShowReauth}>
                    <DialogContent className="sm:max-w-[400px] border-none shadow-2xl p-0 overflow-hidden">
                        <div className="bg-slate-900 p-8 text-center space-y-2">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                                <Shield className="w-8 h-8 text-primary h-8" />
                            </div>
                            <h2 className="text-xl font-black text-white">Identity Verification</h2>
                            <p className="text-slate-400 text-sm">Please confirm your identity to proceed with this sensitive action.</p>
                        </div>
                        <div className="p-8 space-y-4 bg-white">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-black text-slate-400">Verification Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showReauthPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-12 font-bold pr-10"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:bg-transparent"
                                        onClick={() => setShowReauthPass(!showReauthPass)}
                                    >
                                        {showReauthPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button
                                className="w-full h-12 font-black shadow-xl shadow-primary/20"
                                disabled={isUpdating}
                                onClick={handleReverifyAndExecute}
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                VERIFY IDENTITY
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-xs font-bold text-slate-400"
                                onClick={() => setShowReauth(false)}
                            >
                                ABORT ACTION
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    )
}
