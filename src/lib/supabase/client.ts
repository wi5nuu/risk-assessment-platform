/**
 * Supabase Client Configuration
 * Browser and Server clients with proper RLS support
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Browser client for client-side usage
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
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
