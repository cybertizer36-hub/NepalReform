import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserDashboard } from "@/components/user-dashboard"

// Force dynamic rendering for dashboard page (no static generation)
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()

  // During build time with mock client, skip authentication
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co") {
    return <div>Building...</div>
  }

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  return <UserDashboard user={data.user} />
}
