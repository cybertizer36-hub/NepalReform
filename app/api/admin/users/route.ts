import { createClient, createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // 1) Verify session and admin role using regular client (cookie-based)
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2) Use service client only after confirming admin
    const svc = await createServiceClient()
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Use service client to bypass RLS and get all profiles
    const { data: profiles, error: profilesError, count } = await svc
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
    // Verify admin
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const svc = await createServiceClient()
    const body = await request.json()
    
    const { userId, updates } = body
    
    if (!userId || !updates) {
      return NextResponse.json({ error: "Missing userId or updates" }, { status: 400 })
    }
    
    const { data, error } = await svc
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
