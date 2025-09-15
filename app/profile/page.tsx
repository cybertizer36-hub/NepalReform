import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserProfile } from "@/components/user-profile"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return <UserProfile user={data.user} profile={profile} />
}
