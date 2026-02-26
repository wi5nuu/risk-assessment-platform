"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Shield, Mail, Lock, Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, Key, User } from 'lucide-react'
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
    const { email, firstName: authFirstName, lastName: authLastName, role, tempPassword, profileId, userId, avatarUrl, refreshAuth } = useAuth()
    const supabase = createClient() as any

    const [isUpdating, setIsUpdating] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showReauth, setShowReauth] = useState(false)
    const [password, setPassword] = useState('')
    const [pendingAction, setPendingAction] = useState<'email' | 'password' | 'profile' | null>(null)

    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Profile Edit States
    const [editFirstName, setEditFirstName] = useState('')
    const [editLastName, setEditLastName] = useState('')
    const [hasChanges, setHasChanges] = useState(false)

    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showReauthPass, setShowReauthPass] = useState(false)

    // Initialize edit states when auth data is loaded
    React.useEffect(() => {
        if (authFirstName) setEditFirstName(authFirstName)
        if (authLastName) setEditLastName(authLastName)
    }, [authFirstName, authLastName])

    // Check for changes
    React.useEffect(() => {
        setHasChanges(editFirstName !== authFirstName || editLastName !== authLastName)
    }, [editFirstName, editLastName, authFirstName, authLastName])

    const handleActionStart = (action: 'email' | 'password' | 'profile') => {
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
        if (action === 'profile' && !hasChanges) {
            return
        }

        setPendingAction(action)
        setShowReauth(true)
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !userId || !profileId) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB')
            return
        }

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            // Using a consistent filename to effectively "replace" the old one in spirit,
            // though we use a unique path to avoid cache issues at the storage layer.
            const filePath = `${userId}/avatar.${fileExt}`

            // 1. Upload to Supabase Storage (with upsert to replace)
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true,
                    cacheControl: '0' // Tell storage not to cache this
                })

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // 3. Add a cache-buster query param to the URL to force the browser to re-fetch
            const finalUrl = `${publicUrl}?t=${Date.now()}`

            // 4. Update profile record
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ avatar_url: finalUrl })
                .eq('id', profileId)

            if (updateError) throw updateError

            toast.success('Profile picture updated successfully!')
            await refreshAuth() // Ensure global state is updated
        } catch (err: any) {
            console.error('Upload error:', err)
            toast.error('Failed to upload image')
        } finally {
            setIsUploading(false)
        }
    }

    const handleReverifyAndExecute = async () => {
        if (!password) {
            toast.error('Current password is required')
            return
        }

        setIsUpdating(true)
        try {
            // Get the actual email from the auth system to be 100% sure
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            const emailToUse = currentUser?.email || email

            if (!emailToUse) {
                toast.error('Identity sync error: No email associated with this session.')
                setIsUpdating(false)
                return
            }

            // Re-authenticate
            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: password.trim(),
            })

            if (reauthError) {
                console.error('Re-auth error details:', reauthError)
                toast.error(`Identity verification failed: ${reauthError.message}`)
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

                if (profileId) {
                    await supabase
                        .from('user_profiles')
                        .update({ temp_password: newPassword })
                        .eq('id', profileId)
                }
                toast.success('Password updated successfully.')
            } else if (pendingAction === 'profile') {
                if (profileId) {
                    const { error: updateError } = await supabase
                        .from('user_profiles')
                        .update({
                            first_name: editFirstName,
                            last_name: editLastName
                        })
                        .eq('id', profileId)

                    if (updateError) throw updateError
                    toast.success('Profile information updated.')
                    refreshAuth()
                }
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
            <div className="max-w-4xl mx-auto space-y-8 pb-10">
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
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl overflow-hidden border-4 border-white relative">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                                key={avatarUrl} // Force re-render on URL change
                                            />
                                        ) : (
                                            <span>{authFirstName?.[0]}{authLastName?.[0]}</span>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-xl rounded-xl flex items-center justify-center border-2 border-slate-100 cursor-pointer lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:scale-110 active:scale-95">
                                        <Key className="w-5 h-5 text-primary rotate-45" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                                    </label>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{authFirstName} {authLastName}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{email}</p>
                                    <div className="mt-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                            {role || 'Standard'} Account
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-black text-slate-400">First Name</Label>
                                    <Input
                                        className="h-11 font-bold bg-slate-50 border-slate-200 text-slate-900"
                                        value={editFirstName}
                                        onChange={e => setEditFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-black text-slate-400">Last Name</Label>
                                    <Input
                                        className="h-11 font-bold bg-slate-50 border-slate-200 text-slate-900"
                                        value={editLastName}
                                        onChange={e => setEditLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-black text-slate-400">Primary Email</Label>
                                <div className="flex items-center gap-2 text-slate-900 font-bold bg-slate-100/50 p-3 rounded-xl border border-slate-200/50 cursor-not-allowed">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {email}
                                </div>
                            </div>

                            <Button
                                className="w-full h-11 font-black shadow-lg shadow-primary/10"
                                disabled={!hasChanges || isUpdating}
                                onClick={() => handleActionStart('profile')}
                            >
                                UPDATE DISPLAY IDENTITY
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Security Credentials */}
                    <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden text-slate-900">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
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
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Identity Sync</h2>
                            <p className="text-slate-400 text-[11px] font-bold">Please enter your <span className="text-primary underline">Current Password</span> for <span className="text-white">{email}</span> to confirm this action.</p>
                        </div>
                        <div className="p-8 space-y-4 bg-white">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-black text-slate-400">Verification Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showReauthPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-12 font-bold pr-10 text-slate-900"
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
