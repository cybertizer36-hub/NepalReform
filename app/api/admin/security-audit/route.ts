export const runtime = "nodejs"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface PolicyData {
  policyname: string
  cmd: string
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate/authorize with regular client first
    const userClient = await createClient()
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const supabase = await createServiceClient()

    // Perform security audit checks
    const auditResults = {
      rls_status: await checkRLSStatus(supabase),
      connection_health: await checkConnectionHealth(supabase),
      policy_coverage: await checkPolicyCoverage(supabase),
      admin_activity: await getRecentAdminActivity(supabase),
      security_gaps: await identifySecurityGaps(supabase),
    }

    return NextResponse.json(auditResults, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Security audit error:", error)
    return NextResponse.json({ error: "Security audit failed" }, { status: 500 })
  }
}

async function checkRLSStatus(supabase: any) {
  const { data, error } = await supabase.rpc("check_rls_status")
  return { enabled: !error, tables_checked: data?.length || 0 }
}

async function checkConnectionHealth(supabase: any) {
  const { data, error } = await supabase.rpc("check_connection_health")
  return { status: error ? "ERROR" : "OK", metrics: data || [] }
}

async function checkPolicyCoverage(supabase: any) {
  // Check if all tables have appropriate policies
  const tables = ["profiles", "agendas", "suggestions", "agenda_votes", "suggestion_votes", "activity_logs"]
  const coverage: Record<
    string,
    {
      policies: number
      has_select: boolean
      has_insert: boolean
      has_update: boolean
      has_delete: boolean
    }
  > = {}

  for (const table of tables) {
    const { data, error } = await supabase.from("pg_policies").select("policyname, cmd").eq("tablename", table)

    coverage[table] = {
      policies: data?.length || 0,
      has_select: data?.some((p: PolicyData) => p.cmd === "SELECT") || false,
      has_insert: data?.some((p: PolicyData) => p.cmd === "INSERT") || false,
      has_update: data?.some((p: PolicyData) => p.cmd === "UPDATE") || false,
      has_delete: data?.some((p: PolicyData) => p.cmd === "DELETE") || false,
    }
  }

  return coverage
}

async function getRecentAdminActivity(supabase: any) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("action, resource_type, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(10)

  return { recent_actions: data || [], error: error?.message }
}

async function identifySecurityGaps(supabase: any) {
  const gaps = []

  // Check for tables without RLS
  const { data: tables } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

  for (const table of tables || []) {
    const { data: rlsStatus } = await supabase
      .from("pg_class")
      .select("relrowsecurity")
      .eq("relname", table.tablename)
      .single()

    if (!rlsStatus?.relrowsecurity) {
      gaps.push(`Table ${table.tablename} does not have RLS enabled`)
    }
  }

  return gaps
}
