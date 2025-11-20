import { createClient, createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify session and admin role
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

    const { role } = await request.json()
    
    // Validate role
    if (!["user", "moderator", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Await params
    const resolvedParams = await params

    // Update user role
    const { error } = await svc
      .from("profiles")
      .update({ role })
      .eq("id", resolvedParams.id)

    if (error) throw error

    // Log the activity
    await svc.from("activity_logs").insert([
      {
        action: "role_updated",
        resource_type: "user",
        resource_id: resolvedParams.id,
        details: { new_role: role },
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
