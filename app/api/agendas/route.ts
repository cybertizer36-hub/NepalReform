import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 50) // Max 50 items
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from("agendas")
      .select(
        `
        id, title, description, problem_statement, key_points, 
        category, priority_level, status, created_at
      `,
        { count: "exact" },
      )
      .range(from, to)
      .order("created_at", { ascending: false }) // Uses idx_agendas_created_desc index

    if (category) {
      query = query.eq("category", category) // Uses idx_agendas_category_created index
    }

    if (priority) {
      query = query.eq("priority_level", priority)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,problem_statement.ilike.%${search}%`)
    }

    const { data, error, count } = await query

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

    const cacheTime = search ? 60 : 300 // Shorter cache for search results
    response.headers.set(
      "Cache-Control",
      `public, max-age=${cacheTime}, s-maxage=${cacheTime * 2}, stale-while-revalidate=600`,
    )
    response.headers.set("Vary", "Accept, Authorization")

    return response
  } catch (error) {
    console.error("Agenda fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
