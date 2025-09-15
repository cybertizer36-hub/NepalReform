import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { OpinionDetail } from "@/components/opinion-detail"
import { SuggestionSection } from "@/components/suggestion-section"
import { notFound } from "next/navigation"

interface OpinionPageProps {
  params: Promise<{ id: string }>
}

export default async function OpinionPage({ params }: OpinionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: opinion, error } = await supabase.from("agendas").select("*").eq("id", id).single()

  if (error || !opinion) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <OpinionDetail opinion={opinion} />
          <SuggestionSection agendaId={id} />
        </div>
      </main>
    </div>
  )
}
