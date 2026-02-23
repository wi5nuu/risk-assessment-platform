"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Loader2, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
    const supabase = createClient() as any
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (resetError) throw resetError

            setIsSuccess(true)
            toast.success('Reset link sent! Check your email.')
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link')
            toast.error('Error sending reset link')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Mail className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-base">
                        We&apos;ll send you a link to get back into your account.
                    </CardDescription>
                </CardHeader>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@organization.com"
                                    className="h-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 font-semibold text-base shadow-lg shadow-primary/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                            <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sign In
                            </Link>
                        </CardFooter>
                    </form>
                ) : (
                    <CardContent className="space-y-6 flex flex-col items-center text-center pb-8">
                        <div className="p-4 bg-green-50 rounded-full text-green-600 mb-2">
                            <Shield className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-slate-900">Mail Sent Successfully</h3>
                            <p className="text-slate-600">
                                If an account exists for {email}, you will receive a password reset link shortly.
                            </p>
                        </div>
                        <Link href="/auth/login" className="w-full">
                            <Button variant="outline" className="w-full h-11 border-2">
                                Return to Login
                            </Button>
                        </Link>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
