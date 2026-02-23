"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient() as any
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    console.log('Login attempt started for:', email)

    try {
      console.log('Attempting sign-in with email:', email)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Login error details:', signInError)
        setError(signInError.message)
        // If it's an email confirmation issue, explain it clearly
        if (signInError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before logging in.')
        }
        return
      }

      console.log('Login successful! Data:', {
        userId: data.user?.id,
        sessionExists: !!data.session,
        expiresAt: data.session?.expires_at
      })

      if (data.user) {
        console.log('Initiating redirect to /dashboard...')
        console.log('Browser cookies after login:', document.cookie.split(';').map(c => c.trim().split('=')[0]))

        toast.success('Login successful! Redirecting...')

        // Use router.push and force a hard refresh if needed
        window.location.href = '/dashboard'
      } else {
        console.warn('Login returned no user data')
        toast.error('Login failed: No user data returned')
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err)
      setError('An unexpected error occurred: ' + (err.message || 'Please try again.'))
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            OCTAVE Allegro Risk Assessment
          </CardTitle>
          <CardDescription>
            Sign in to access your risk assessment projects
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="text-primary hover:underline"
              >
                Register now
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
