import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OpinionForm } from "@/components/opinion-form"

export default async function CreateOpinionPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Agenda</h1>
            <p className="text-muted-foreground">
              Share your thoughts and proposals for Nepal's democratic reforms. Your opinion will be reviewed before
              being published.
            </p>
          </div>

          <OpinionForm />
        </div>
      </div>
    </div>
  )
}
