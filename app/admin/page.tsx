import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

// Force dynamic rendering for admin page (no static generation)
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPage() {
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

  // Restrict access to admin and moderator roles only
  if (!profile?.role || (profile.role !== "admin" && profile.role !== "moderator")) {
    redirect("/dashboard")
  }

  return <AdminDashboard user={data.user} />
}
