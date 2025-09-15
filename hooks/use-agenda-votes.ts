"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface VoteData {
  likes: number
  dislikes: number
  userVote: "like" | "dislike" | null
}

export function useAgendaVotes(agendaId: string) {
  // Initialize with localStorage data for immediate UI update
  const getInitialVoteData = (): VoteData => {
    if (typeof window !== "undefined") {
      const storedVote = localStorage.getItem(`vote_${agendaId}`)
      const storedCounts = localStorage.getItem(`vote_counts_${agendaId}`)
      
      if (storedCounts) {
        try {
          const counts = JSON.parse(storedCounts)
          return {
            likes: counts.likes || 0,
            dislikes: counts.dislikes || 0,
            userVote: (storedVote as "like" | "dislike") || null,
          }
        } catch (e) {
          // Invalid stored data, use defaults
        }
      }
    }
    
    return {
      likes: 0,
      dislikes: 0,
      userVote: null,
    }
  }

  const [voteData, setVoteData] = useState<VoteData>(getInitialVoteData())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Store vote data in localStorage whenever it changes
  const persistVoteData = useCallback((data: VoteData) => {
    if (typeof window !== "undefined") {
      if (data.userVote) {
        localStorage.setItem(`vote_${agendaId}`, data.userVote)
      } else {
        localStorage.removeItem(`vote_${agendaId}`)
      }
      
      localStorage.setItem(`vote_counts_${agendaId}`, JSON.stringify({
        likes: data.likes,
        dislikes: data.dislikes,
        timestamp: Date.now()
      }))
    }
  }, [agendaId])

  // Fetch votes from database
  const fetchVotes = useCallback(async () => {
    try {
      console.log("[v0] Fetching votes for agenda ID:", agendaId)
      const response = await fetch(`/api/agendas/${agendaId}/vote`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] API response error:", response.status, errorData)
        throw new Error(errorData.error || "Failed to fetch votes")
      }

      const data = await response.json()
      console.log("[v0] Received vote data:", data)

      const newVoteData = {
        likes: data.likes,
        dislikes: data.dislikes,
        userVote: data.userVote,
      }

      setVoteData(newVoteData)
      persistVoteData(newVoteData)
      setError(null)
      setIsInitialLoad(false)
    } catch (err) {
      console.error("Error fetching votes:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch votes")
      setIsInitialLoad(false)
    }
  }, [agendaId, persistVoteData])

  // Set up initial fetch and real-time subscription
  useEffect(() => {
    const supabase = createClient()

    // Fetch initial data
    if (agendaId) {
      fetchVotes()
    }

    // Set up real-time subscription
    const setupRealtimeSubscription = () => {
      const channel = supabase
        .channel(`agenda_votes_${agendaId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "agenda_votes",
            filter: `agenda_id=eq.${agendaId}`,
          },
          async (payload) => {
            console.log("[v0] Real-time vote update received:", payload)
            // Refetch vote counts when any vote changes
            await fetchVotes()
          },
        )
        .subscribe()

      return channel
    }

    if (agendaId) {
      const channel = setupRealtimeSubscription()

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [agendaId, fetchVotes])

  // Handle voting with optimistic updates
  const handleVote = async (voteType: "like" | "dislike") => {
    setIsLoading(true)
    setError(null)

    // Optimistic update
    const currentVote = voteData.userVote
    let optimisticData = { ...voteData }

    if (currentVote === voteType) {
      // Removing vote
      optimisticData.userVote = null
      if (voteType === "like") {
        optimisticData.likes = Math.max(0, optimisticData.likes - 1)
      } else {
        optimisticData.dislikes = Math.max(0, optimisticData.dislikes - 1)
      }
    } else {
      // Adding or changing vote
      if (currentVote === "like") {
        optimisticData.likes = Math.max(0, optimisticData.likes - 1)
      } else if (currentVote === "dislike") {
        optimisticData.dislikes = Math.max(0, optimisticData.dislikes - 1)
      }

      optimisticData.userVote = voteType
      if (voteType === "like") {
        optimisticData.likes += 1
      } else {
        optimisticData.dislikes += 1
      }
    }

    // Apply optimistic update
    setVoteData(optimisticData)
    persistVoteData(optimisticData)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Please sign in to vote on this agenda item")
        // Revert optimistic update
        await fetchVotes()
        setIsLoading(false)
        return
      }

      console.log("[v0] Submitting vote:", voteType, "for agenda:", agendaId)

      const response = await fetch(`/api/agendas/${agendaId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote_type: voteType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Vote submission error:", response.status, errorData)
        throw new Error(errorData.error || "Failed to submit vote")
      }

      const data = await response.json()
      console.log("[v0] Vote submission successful:", data)

      const newVoteData = {
        likes: data.likes,
        dislikes: data.dislikes,
        userVote: data.userVote,
      }

      setVoteData(newVoteData)
      persistVoteData(newVoteData)
    } catch (err) {
      console.error("Error voting:", err)
      setError(err instanceof Error ? err.message : "Failed to submit vote")
      // Revert to actual data on error
      await fetchVotes()
    } finally {
      setIsLoading(false)
    }
  }

  return {
    voteData,
    handleVote,
    isLoading: isLoading || isInitialLoad,
    error,
  }
}
