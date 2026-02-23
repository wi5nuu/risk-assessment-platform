/**
 * Next.js Middleware
 * Handles authentication, authorization, and security headers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession, isProtectedRoute, isAdminRoute } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  
  const pathname = request.nextUrl.pathname
  
  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Protect private routes
  if (isProtectedRoute(pathname) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Check admin routes
  if (isAdminRoute(pathname) && user) {
    // Get user profile to check role
    const supabase = createServiceClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return supabaseResponse
}

// Create service client for middleware
function createServiceClient() {
  const { createServerClient } = require('@supabase/ssr')
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // noop
        },
      },
    }
  )
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
