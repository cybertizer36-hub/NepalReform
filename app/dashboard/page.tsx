import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserDashboard } from "@/components/user-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

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
