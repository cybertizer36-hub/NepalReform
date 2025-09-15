import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Welcome to Your Dashboard</h1>
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Your Account</h2>
            <p className="text-muted-foreground mb-2">Email: {data.user.email}</p>
            <p className="text-muted-foreground">User ID: {data.user.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
