"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Building2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'

interface OrgData {
    id: string
    name: string
    industry: string | null
    size: string | null
    address: string | null
    city: string | null
    country: string | null
    website: string | null
    contact_email: string | null
    contact_phone: string | null
}

export default function OrganizationPage() {
    const router = useRouter()
    const auth = useAuth()
    const [org, setOrg] = useState<OrgData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!auth.isLoading) {
            if (!auth.isAdmin()) {
                router.push('/dashboard')
                return
            }
            loadOrg()
        }
    }, [auth.isLoading])

    const loadOrg = async () => {
        try {
            const res = await fetch('/api/admin/organization')
            const data = await res.json()
            if (res.ok) setOrg(data.organization)
            else toast.error(data.error)
        } catch { toast.error('Failed to load organization') }
        finally { setIsLoading(false) }
    }

    const handleSave = async () => {
        if (!org) return
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/organization', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: org.name,
                    industry: org.industry,
                    size: org.size,
                    address: org.address,
                    city: org.city,
                    country: org.country,
                    website: org.website,
                    contact_email: org.contact_email,
                    contact_phone: org.contact_phone,
                }),
            })
            if (res.ok) toast.success('Organization updated')
            else {
                const d = await res.json()
                toast.error(d.error)
            }
        } catch { toast.error('Failed to save') }
        finally { setIsSaving(false) }
    }

    if (auth.isLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (!org) return null

    return (
        <MainLayout>
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Building2 className="w-6 h-6" />
                            Organization Profile
                        </h1>
                        <p className="text-muted-foreground text-sm">Manage your organization details for audit reports.</p>
                    </div>
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b">
                        <CardTitle>Organization Information</CardTitle>
                        <CardDescription>Update your organization&apos;s profile information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div>
                            <Label>Organization Name *</Label>
                            <Input className="mt-1.5" value={org.name || ''} onChange={e => setOrg({ ...org, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Industry</Label>
                                <Input className="mt-1.5" value={org.industry || ''} onChange={e => setOrg({ ...org, industry: e.target.value })} placeholder="e.g. Technology, Healthcare" />
                            </div>
                            <div>
                                <Label>Organization Size</Label>
                                <Input className="mt-1.5" value={org.size || ''} onChange={e => setOrg({ ...org, size: e.target.value })} placeholder="e.g. 50-100 employees" />
                            </div>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input className="mt-1.5" value={org.address || ''} onChange={e => setOrg({ ...org, address: e.target.value })} placeholder="Street address" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>City</Label>
                                <Input className="mt-1.5" value={org.city || ''} onChange={e => setOrg({ ...org, city: e.target.value })} />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input className="mt-1.5" value={org.country || ''} onChange={e => setOrg({ ...org, country: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label>Website</Label>
                            <Input className="mt-1.5" value={org.website || ''} onChange={e => setOrg({ ...org, website: e.target.value })} placeholder="https://" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Contact Email</Label>
                                <Input className="mt-1.5" type="email" value={org.contact_email || ''} onChange={e => setOrg({ ...org, contact_email: e.target.value })} />
                            </div>
                            <div>
                                <Label>Contact Phone</Label>
                                <Input className="mt-1.5" value={org.contact_phone || ''} onChange={e => setOrg({ ...org, contact_phone: e.target.value })} />
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving} className="w-full mt-4">
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save All Changes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
