import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient()

    // Verify admin access
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { is_active } = await request.json()

    // Await params
    const resolvedParams = await params

    // Update user status
    const { error } = await supabase
      .from("profiles")
      .update({ is_active })
      .eq("id", resolvedParams.id)

    if (error) throw error

    // Log the activity
    await supabase.from("activity_logs").insert([
      {
        action: is_active ? "user_activated" : "user_deactivated",
        resource_type: "user",
        resource_id: resolvedParams.id,
        details: { status: is_active },
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
