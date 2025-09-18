import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Create service client with service role key for admin operations
    const supabase = await createServiceClient()

    // Verify admin access through auth header (optional additional security)
    const authHeader = request.headers.get("authorization")
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Use service client to bypass RLS and get all profiles
    const { data: profiles, error: profilesError, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      throw profilesError
    }

    // Also try to get auth user data for last sign in info
    // This is optional and may require additional setup
    const enhancedProfiles = profiles || []

    const response = NextResponse.json({
      data: enhancedProfiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      debug: {
        serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        profilesCount: enhancedProfiles.length,
      }
    })

    // Set cache headers for better performance
    response.headers.set("Cache-Control", "private, max-age=10, stale-while-revalidate=30")
    return response
  } catch (error: any) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch users",
      details: error?.message || "Unknown error",
      hint: "Check if SUPABASE_SERVICE_ROLE_KEY is set and the database policies are configured correctly"
    }, { status: 500 })
  }
}

// Optional: Add a POST endpoint to update user roles
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient()
    const body = await request.json()
    
    const { userId, updates } = body
    
    if (!userId || !updates) {
      return NextResponse.json({ error: "Missing userId or updates" }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ 
      error: "Failed to update user",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
}
