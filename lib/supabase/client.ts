import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  if (supabaseUrl.trim() === "" || supabaseAnonKey.trim() === "") {
    throw new Error("Supabase environment variables are empty")
  }

  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    return client
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}
