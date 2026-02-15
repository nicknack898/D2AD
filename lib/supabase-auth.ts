import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client for browser
export function createClientForBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}
