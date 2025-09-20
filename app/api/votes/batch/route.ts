import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { itemIds, table } = await request.json()

    if (!itemIds || !Array.isArray(itemIds) || !table) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    if (!["agenda_votes", "suggestion_votes"].includes(table)) {
      return NextResponse.json({ error: "Invalid table specified" }, { status: 400 })
    }

    if (itemIds.length > 100) {
      return NextResponse.json({ error: "Too many items requested (max 100)" }, { status: 400 })
    }

    const itemIdColumn = table === "agenda_votes" ? "agenda_id" : "suggestion_id"

    // Get user for user-specific votes
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: votes, error } = await supabase
      .from(table)
      .select(`${itemIdColumn}, vote_type, user_id`)
      .in(itemIdColumn, itemIds)
      .order(`${itemIdColumn}, vote_type`) // Leverage index ordering

    if (error) throw error

    // Process vote counts and user votes
    const voteCounts: Record<string, { likes: number; dislikes: number }> = {}
    const userVotes: Record<string, string> = {}

    itemIds.forEach((id) => {
      voteCounts[id] = { likes: 0, dislikes: 0 }
    })

    const voteMap = new Map<string, { likes: number; dislikes: number }>()
    const userVoteMap = new Map<string, string>()

    interface Vote {
      [key: string]: string // allow access to both "agenda_id" and "suggestion_id"
      vote_type: string
      user_id: string
    }

    votes?.forEach((vote: Vote) => {
      const itemId = vote[itemIdColumn]

      if (!voteMap.has(itemId)) {
        voteMap.set(itemId, { likes: 0, dislikes: 0 })
      }

      const counts = voteMap.get(itemId)!
      if (vote.vote_type === "like") {
        counts.likes++
      } else if (vote.vote_type === "dislike") {
        counts.dislikes++
      }

      if (user && vote.user_id === user.id) {
        userVoteMap.set(itemId, vote.vote_type)
      }
    })

    // Convert Maps back to objects for response
    voteMap.forEach((counts, itemId) => {
      voteCounts[itemId] = counts
    })

    userVoteMap.forEach((voteType, itemId) => {
      userVotes[itemId] = voteType
    })

    const response = NextResponse.json({ voteCounts, userVotes })
    response.headers.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300")
    response.headers.set("Vary", "Authorization")
    return response
  } catch (error) {
    console.error("Batch vote fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
