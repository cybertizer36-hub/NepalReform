export const runtime = "nodejs"

import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()

    // Verify admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get connection statistics
    const { data: connectionStats, error: statsError } = await supabase.from("connection_stats").select("*").single()

    const { data: healthCheck, error: healthError } = await supabase.rpc("check_connection_health")

    const monitoring = {
      connection_stats: connectionStats,
      health_metrics: healthCheck,
      pgbouncer_recommended: connectionStats?.active_connections > 50,
      optimization_suggestions: generateOptimizationSuggestions(connectionStats, healthCheck),
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(monitoring, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Connection monitoring error:", error)
    return NextResponse.json({ error: "Connection monitoring failed" }, { status: 500 })
  }
}

function generateOptimizationSuggestions(stats: any, health: any) {
  const suggestions = []

  if (stats?.active_connections > 50) {
    suggestions.push({
      type: "CONNECTION_POOLING",
      priority: "HIGH",
      message: "Enable pgBouncer connection pooling to manage high connection count",
      action: "Configure pgBouncer in Supabase dashboard",
    })
  }

  const cacheHitRatio = health?.find((m: { metric: string; value: number }) => m.metric === "cache_hit_ratio")?.value
  if (cacheHitRatio && cacheHitRatio < 90) {
    suggestions.push({
      type: "CACHE_OPTIMIZATION",
      priority: "MEDIUM",
      message: `Cache hit ratio is ${cacheHitRatio}%. Consider optimizing queries or increasing shared_buffers`,
      action: "Review slow queries and add appropriate indexes",
    })
  }

  return suggestions
}
