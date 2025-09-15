import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

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
