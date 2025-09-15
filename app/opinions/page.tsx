import { createClient } from "@/lib/supabase/server"
import { OpinionBrowser } from "@/components/opinion-browser"
import { Header } from "@/components/header"

export default async function OpinionsPage() {
  const supabase = await createClient()

  // Fetch initial opinions data
  const { data: opinions, error } = await supabase.from("agendas").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching opinions:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Community Opinions</h1>
            <p className="text-muted-foreground">
              Explore diverse perspectives and reform proposals from Nepal's engaged citizens.
            </p>
          </div>

          <OpinionBrowser initialOpinions={opinions || []} />
        </div>
      </main>
    </div>
  )
}
