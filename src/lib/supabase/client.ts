import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function createBrowserSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured.')
  }
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey) as SupabaseClient
}

// Alias for backward compatibility
export const createBrowserClient = createBrowserSupabaseClient

export const supabase = createBrowserSupabaseClient()
