/**
 * Next.js Middleware
 * Handles authentication, authorization, and security headers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession, isProtectedRoute, isAdminRoute } from '@/lib/supabase/middleware'

import { createAdminClient } from '@/lib/supabase/admin'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Protect private routes
  if (isProtectedRoute(pathname) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Role-based access control
  if (user) {
    const isCreationRoute = pathname.startsWith('/wizard') || pathname.startsWith('/projects/new')
    const isAdminOnlyRoute = isAdminRoute(pathname)

    if (isAdminOnlyRoute || isCreationRoute) {
      try {
        const adminClient = createAdminClient()
        const { data: profile } = await adminClient
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single() as any

        if (isAdminOnlyRoute && profile?.role !== 'admin') {
          console.log(`Middleware: ${profile?.role} denied access to admin route ${pathname}`)
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        if (isCreationRoute && profile?.role === 'auditee') {
          console.log(`Middleware: auditee denied access to creation route ${pathname}`)
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (err) {
        console.error('Middleware role check failed:', err)
        // If check fails, we err on the side of caution for admin routes 
        // but allow other routes to proceed if the page itself handles error
        if (isAdminOnlyRoute) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
