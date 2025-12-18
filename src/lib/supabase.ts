/**
 * Supabase Client for Next.js
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create untyped client to avoid strict type issues with the database schema
// The database types are used for type hints in components, not for strict validation
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use localStorage for session persistence (default for web)
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Prevent multiple tabs from conflicting
    storageKey: 'tool-connect-auth',
  },
})

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export default supabase
