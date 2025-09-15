"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface VoteCounts {
  [itemId: string]: {
    likes: number
    dislikes: number
  }
}

interface UserVotes {
  [itemId: string]: "like" | "dislike"
}

export function useVoting(table: "agenda_votes" | "suggestion_votes", itemIds: string[]) {
  const [userVotes, setUserVotes] = useState<UserVotes>({})
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({})
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
    if (itemIds.length > 0) {
      fetchBatchVotes()
    }
  }, [itemIds])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const fetchBatchVotes = async () => {
    try {
      const response = await fetch("/api/votes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds, table }),
      })

      if (!response.ok) throw new Error("Failed to fetch votes")

      const { voteCounts: counts, userVotes: votes } = await response.json()
      setVoteCounts(counts)
      setUserVotes(votes)
    } catch (error) {
      console.error("Error fetching batch votes:", error)
    }
  }

  const handleVote = async (itemId: string, voteType: "like" | "dislike") => {
    if (!user) {
      window.location.href = "/auth/login"
      return
    }

    try {
      const endpoint = table === "agenda_votes" ? `/api/agendas/${itemId}/vote` : `/api/suggestions/${itemId}/vote`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote_type: voteType }),
      })

      if (!response.ok) throw new Error("Vote failed")

      const { likes, dislikes, userVote } = await response.json()

      // Update local state
      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: { likes, dislikes },
      }))

      setUserVotes((prev) => {
        const newVotes = { ...prev }
        if (userVote) {
          newVotes[itemId] = userVote
        } else {
          delete newVotes[itemId]
        }
        return newVotes
      })
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  return {
    userVotes,
    voteCounts,
    handleVote,
    user,
    loading,
  }
}
