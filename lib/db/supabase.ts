import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side client (anon key — respects RLS)
export const supabase = url && anonKey ? createClient(url, anonKey) : null

// Server-side client (service role — bypasses RLS, only used in API routes)
export const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : supabase  // fall back to anon client if no service key

export const supabaseEnabled = !!supabase
