"use client"

import { useEffect, useState, useMemo, useCallback, memo } from "react"
import { createClient } from "@/lib/supabase/client"
import { AgendaCard } from "./agenda-card"
import { Button } from "@/components/ui/button"
import { Loader2, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Try to import react-window components with fallback
let FixedSizeList: any = null
if (typeof window !== "undefined") {
  try {
    const ReactWindow = require("react-window")
    FixedSizeList = ReactWindow.FixedSizeList || ReactWindow.default?.FixedSizeList
  } catch (e) {
    console.warn("react-window not available, falling back to regular list rendering")
  }
}

interface Agenda {
  id: string
  title: string
  description: string
  problem_statement: string
  key_points: string[]
  category: string
  proposed_solutions: string[]
  implementation_timeline: string
  expected_outcomes: string[]
  stakeholders: string[]
  priority_level: "High" | "Medium" | "Low"
  status: "Draft" | "Under Review" | "Approved" | "Implemented"
  tags: string[]
  references: string[]
  created_at: string
}

interface AgendaVote {
  agenda_id: string
  vote_type: "like" | "dislike"
}

interface VoteCounts {
  [agendaId: string]: {
    likes: number
    dislikes: number
  }
}

const AgendaItem = memo(({ index, style, data }: { index: number; style: any; data: any }) => {
  const { agendas } = data
  const agendaItem = agendas[index]

  return (
    <div style={style} className="px-2 py-3">
      <AgendaCard agenda={agendaItem} />
    </div>
  )
})

AgendaItem.displayName = "AgendaItem"

export const AgendaList = memo(() => {
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [userVotes, setUserVotes] = useState<{ [agendaId: string]: "like" | "dislike" }>({})
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  const categories = useMemo(() => [...new Set(agendas.map((agenda) => agenda.category))], [agendas])
  const priorities = useMemo(() => ["High", "Medium", "Low"], [])
  const statuses = useMemo(() => ["Draft", "Under Review", "Approved", "Implemented"], [])

  const filteredAgendas = useMemo(() => {
    return agendas.filter((agenda) => {
      const categoryMatch = selectedCategory === null || agenda.category === selectedCategory
      const priorityMatch = selectedPriority === null || agenda.priority_level === selectedPriority
      const statusMatch = selectedStatus === null || agenda.status === selectedStatus
      return categoryMatch && priorityMatch && statusMatch
    })
  }, [agendas, selectedCategory, selectedPriority, selectedStatus])

  const hasActiveFilters = useMemo(
    () => selectedCategory || selectedPriority || selectedStatus,
    [selectedCategory, selectedPriority, selectedStatus],
  )

  const fetchVoteCounts = useCallback(
    async (agendaIds: string[]) => {
      try {
        // Use batch API instead of direct Supabase query to leverage caching and optimization
        const response = await fetch("/api/votes/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemIds: agendaIds,
            table: "agenda_votes",
          }),
        })

        if (!response.ok) throw new Error("Failed to fetch vote counts")

        const { voteCounts: counts, userVotes: votes } = await response.json()
        setVoteCounts(counts)

        // Update user votes if user is authenticated
        if (user && votes) {
          setUserVotes(votes)
        }
      } catch (error) {
        console.error("Error fetching vote counts:", error)
      }
    },
    [user],
  )

  useEffect(() => {
    fetchAgendas()
    checkUser()
  }, [])

  const checkUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      fetchUserVotes(user.id)
    }
  }, [supabase.auth])

  const fetchAgendas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("agendas")
        .select(`
          id, title, description, problem_statement, key_points, 
          category, priority_level, status, created_at,
          proposed_solutions, implementation_timeline, 
          expected_outcomes, stakeholders, tags, references
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setAgendas(data || [])

      // Fetch vote counts for all agendas using optimized batch API
      if (data) {
        const agendaArray: Agenda[] = data as Agenda[];
        await fetchVoteCounts(agendaArray.map((a: Agenda) => a.id))
      }
    } catch (error) {
      console.error("Error fetching agendas:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchVoteCounts])

  const fetchUserVotes = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase.from("agenda_votes").select("agenda_id, vote_type").eq("user_id", userId)

        if (error) throw error

        const votes: { [agendaId: string]: "like" | "dislike" } = {}
        data?.forEach((vote: AgendaVote) => {
          votes[vote.agenda_id] = vote.vote_type
        })

        setUserVotes(votes)
      } catch (error) {
        console.error("Error fetching user votes:", error)
      }
    },
    [supabase],
  )

  // Keep the handleVote function for potential future use or if AgendaVoteSection needs it
  const handleVote = useCallback(
    async (agendaId: string, voteType: "like" | "dislike") => {
      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      try {
        const currentVote = userVotes[agendaId]

        if (currentVote === voteType) {
          const { error } = await supabase
            .from("agenda_votes")
            .delete()
            .eq("agenda_id", agendaId)
            .eq("user_id", user.id)

          if (error) throw error

          setUserVotes((prev) => {
            const newVotes = { ...prev }
            delete newVotes[agendaId]
            return newVotes
          })

          setVoteCounts((prev) => ({
            ...prev,
            [agendaId]: {
              ...prev[agendaId],
              [voteType === "like" ? "likes" : "dislikes"]: Math.max(
                0,
                prev[agendaId]?.[voteType === "like" ? "likes" : "dislikes"] - 1,
              ),
            },
          }))
        } else {
          const { error } = await supabase.from("agenda_votes").upsert({
            agenda_id: agendaId,
            user_id: user.id,
            vote_type: voteType,
          })

          if (error) throw error

          setUserVotes((prev) => ({
            ...prev,
            [agendaId]: voteType,
          }))

          setVoteCounts((prev) => {
            const newCounts = { ...prev }
            if (!newCounts[agendaId]) {
              newCounts[agendaId] = { likes: 0, dislikes: 0 }
            }

            if (currentVote) {
              newCounts[agendaId][currentVote === "like" ? "likes" : "dislikes"] = Math.max(
                0,
                newCounts[agendaId][currentVote === "like" ? "likes" : "dislikes"] - 1,
              )
            }

            newCounts[agendaId][voteType === "like" ? "likes" : "dislikes"]++

            return newCounts
          })
        }
      } catch (error) {
        console.error("Error voting:", error)
      }
    },
    [user, userVotes, supabase],
  )

  const clearFilters = useCallback(() => {
    setSelectedCategory(null)
    setSelectedPriority(null)
    setSelectedStatus(null)
  }, [])

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category)
  }, [])

  const handlePriorityChange = useCallback((priority: string | null) => {
    setSelectedPriority(priority)
  }, [])

  const handleStatusChange = useCallback((status: string | null) => {
    setSelectedStatus(status)
  }, [])

  const listData = useMemo(
    () => ({
      agendas: filteredAgendas,
      userVotes,
      voteCounts,
    }),
    [filteredAgendas, userVotes, voteCounts],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          </div>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedCategory ? "default" : "outline"} size="sm">
                {selectedCategory || "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCategoryChange(null)}>All Categories</DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem key={category} onClick={() => handleCategoryChange(category)}>
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedPriority ? "default" : "outline"} size="sm">
                {selectedPriority ? `${selectedPriority} Priority` : "All Priorities"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Priority Levels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePriorityChange(null)}>All Priorities</DropdownMenuItem>
              {priorities.map((priority) => (
                <DropdownMenuItem key={priority} onClick={() => handlePriorityChange(priority)}>
                  {priority} Priority
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedStatus ? "default" : "outline"} size="sm">
                {selectedStatus || "All Statuses"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange(null)}>All Statuses</DropdownMenuItem>
              {statuses.map((status) => (
                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="text-xs">
                Category: {selectedCategory}
              </Badge>
            )}
            {selectedPriority && (
              <Badge variant="secondary" className="text-xs">
                Priority: {selectedPriority}
              </Badge>
            )}
            {selectedStatus && (
              <Badge variant="secondary" className="text-xs">
                Status: {selectedStatus}
              </Badge>
            )}
          </div>
        )}
      </div>

      {filteredAgendas.length > 10 && FixedSizeList ? (
        <div className="h-[800px]">
          <FixedSizeList height={800} itemCount={filteredAgendas.length} itemSize={400} itemData={listData}>
            {AgendaItem}
          </FixedSizeList>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAgendas.map((agenda) => (
            <AgendaCard key={agenda.id} agenda={agenda} />
          ))}
        </div>
      )}

      {filteredAgendas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {hasActiveFilters ? "No agendas match the selected filters." : "No agendas found."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 bg-transparent">
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
})
