import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time with placeholder values, return a mock client
  if (
    supabaseUrl === "https://placeholder.supabase.co" ||
    supabaseAnonKey?.includes("placeholder") ||
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    // Return a mock client during build that won't crash
    // This is only for build time - runtime will have real values
    if (typeof window === 'undefined') {
      // Server-side build time - return minimal mock with proper chaining
      const createQueryBuilder = () => {
        const queryBuilder = {
          select: () => queryBuilder,
          insert: () => queryBuilder,
          update: () => queryBuilder,
          delete: () => queryBuilder,
          upsert: () => queryBuilder,
          eq: () => queryBuilder,
          neq: () => queryBuilder,
          gt: () => queryBuilder,
          gte: () => queryBuilder,
          lt: () => queryBuilder,
          lte: () => queryBuilder,
          like: () => queryBuilder,
          ilike: () => queryBuilder,
          is: () => queryBuilder,
          in: () => queryBuilder,
          contains: () => queryBuilder,
          containedBy: () => queryBuilder,
          rangeGt: () => queryBuilder,
          rangeGte: () => queryBuilder,
          rangeLt: () => queryBuilder,
          rangeLte: () => queryBuilder,
          rangeAdjacent: () => queryBuilder,
          overlaps: () => queryBuilder,
          textSearch: () => queryBuilder,
          match: () => queryBuilder,
          not: () => queryBuilder,
          or: () => queryBuilder,
          filter: () => queryBuilder,
          order: () => queryBuilder,
          limit: () => queryBuilder,
          range: () => queryBuilder,
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          then: (resolve: Function) => resolve({ data: [], error: null, count: 0 }),
          catch: () => queryBuilder
        }
        return queryBuilder
      }
      
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          signIn: async () => ({ data: null, error: new Error("Build time mock") }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        },
        from: () => createQueryBuilder()
      } as any
    }
    
    // Client-side - show error
    console.error("Missing or invalid Supabase environment variables")
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
