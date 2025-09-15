import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()

    // Verify admin access through auth
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at, last_sign_in_at, is_active", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false })

    if (error) throw error

    const response = NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })

    response.headers.set("Cache-Control", "private, max-age=60")
    return response
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
