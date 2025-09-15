"use client"

import { useState } from "react"
import { SuggestionForm } from "./suggestion-form"
import { SuggestionList } from "./suggestion-list"

interface SuggestionSectionProps {
  agendaId: string
}

export function SuggestionSection({ agendaId }: SuggestionSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuggestionAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <SuggestionForm agendaId={agendaId} onSuggestionAdded={handleSuggestionAdded} />
      <SuggestionList agendaId={agendaId} refreshTrigger={refreshTrigger} />
    </div>
  )
}
