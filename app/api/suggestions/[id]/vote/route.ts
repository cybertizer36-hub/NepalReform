import { createClient, createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { validateSuggestionUUID } from "@/lib/utils/uuid-helpers"
import { isAllowedOrigin } from "@/lib/security/origin"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id } = await params

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { vote_type } = body

    if (!vote_type || !["like", "dislike"].includes(vote_type)) {
      return NextResponse.json({ error: "Invalid vote type. Must be 'like' or 'dislike'" }, { status: 400 })
    }

    const suggestion_id = id

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suggestion_id)) {
      return NextResponse.json({ error: "Invalid suggestion ID format" }, { status: 400 })
    }

    const { data: suggestionExists, error: checkError } = await supabase
      .from("suggestions")
      .select("id")
      .eq("id", suggestion_id)
      .single()

    if (checkError || !suggestionExists) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 })
    }

    const { data: existingVote } = await supabase
      .from("suggestion_votes")
      .select("*")
      .eq("suggestion_id", suggestion_id)
      .eq("user_id", user.id)
      .single()

    let operation = "created"

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote if clicking same button
        const { error } = await supabase.from("suggestion_votes").delete().eq("id", existingVote.id)

        if (error) {
          console.error("Error removing vote:", error)
          return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 })
        }
        operation = "removed"
      } else {
        // Update vote type if different
        const { error } = await supabase.from("suggestion_votes").update({ vote_type }).eq("id", existingVote.id)

        if (error) {
          console.error("Error updating vote:", error)
          return NextResponse.json({ error: "Failed to update vote" }, { status: 500 })
        }
        operation = "updated"
      }
    } else {
      // Create new vote
      const { error } = await supabase.from("suggestion_votes").insert({
        suggestion_id,
        user_id: user.id,
        vote_type,
      })

      if (error) {
        console.error("Error creating vote:", error)
        return NextResponse.json({ error: "Failed to create vote" }, { status: 500 })
      }
    }

    const { data: voteCounts, error: countError } = await supabase
      .from("suggestion_votes")
      .select("vote_type")
      .eq("suggestion_id", suggestion_id)

    if (countError) {
      console.error("Error fetching vote counts:", countError)
      return NextResponse.json({ error: "Failed to fetch vote counts" }, { status: 500 })
    }

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    let userVote: "like" | "dislike" | null = null
    if (operation === "removed") {
      userVote = null
    } else if (operation === "created" || operation === "updated") {
      userVote = vote_type
    }

    return NextResponse.json({
      success: true,
      likes,
      dislikes,
      userVote,
      operation,
    })
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const svc = await createServiceClient()
    const suggestion_id = id

    console.log("[v0] Fetching votes for suggestion:", suggestion_id)

    // Validate suggestion UUID and check if it exists
    const validation = await validateSuggestionUUID(suggestion_id)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (!validation.exists) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 })
    }

    // Get vote counts using service role (no raw rows exposed via public RLS)
    const { data: voteCounts } = await svc
      .from("suggestion_votes")
      .select("vote_type")
      .eq("suggestion_id", suggestion_id)

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    console.log("[v0] Vote counts - Likes:", likes, "Dislikes:", dislikes)

    // Get user's vote if authenticated (service role filtered by user_id)
    let userVote = null
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: existingVote } = await svc
        .from("suggestion_votes")
        .select("vote_type")
        .eq("suggestion_id", suggestion_id)
        .eq("user_id", user.id)
        .single()

      userVote = existingVote?.vote_type || null
      console.log("[v0] User vote:", userVote)
    }

    const response = NextResponse.json({ likes, dislikes, userVote })
    response.headers.set("Cache-Control", "public, max-age=60, s-maxage=60")
    return response
  } catch (error) {
    console.error("Get votes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
