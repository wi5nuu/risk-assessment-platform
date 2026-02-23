/**
 * Supabase Client Configuration
 * Browser and Server clients with proper RLS support
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Validate key format on every session update
if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
  console.error(
    'Please use the Supabase "Anon / Public" key from your dashboard.'
  )
}

// Browser client for client-side usage
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      // Standard browser client handles cookies automatically, 
      // but we can be explicit about security in development
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  })
}

// Service role client for admin operations (server-only)
// Note: This should ideally be moved to server.ts, but keeping here for minimal disruption
// as it uses createBrowserClient which is safe for build if not executed on client.
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }

  return createBrowserClient<Database>(supabaseUrl, serviceRoleKey)
}
