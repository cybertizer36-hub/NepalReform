import { createClient, createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { validateAndNormalizeAgendaId } from "@/lib/utils/uuid-helpers"
import { isAllowedOrigin } from "@/lib/security/origin"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // CSRF: require same-origin for state-changing request
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id } = await params

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Authentication failed for vote request:", authError?.message || "No user")
      return NextResponse.json({ error: "Please sign in to vote on agenda items" }, { status: 401 })
    }

    const { vote_type } = await request.json()

    if (!vote_type || !["like", "dislike"].includes(vote_type)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    console.log("[v0] Processing vote for agenda ID:", id, "Vote type:", vote_type)

    const validation = await validateAndNormalizeAgendaId(id)
    if (!validation.isValid || !validation.agendaUUID) {
      return NextResponse.json({ error: validation.error || "Invalid agenda ID" }, { status: 400 })
    }

    const agenda_id = validation.agendaUUID

    console.log("[v0] Using agenda UUID for database operations:", agenda_id)

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("agenda_votes")
      .select("*")
      .eq("agenda_id", agenda_id)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote if clicking same button
        const { error } = await supabase.from("agenda_votes").delete().eq("id", existingVote.id)

        if (error) throw error
        console.log("[v0] Removed vote for agenda:", agenda_id)
      } else {
        // Update vote type if different
        const { error } = await supabase.from("agenda_votes").update({ vote_type }).eq("id", existingVote.id)

        if (error) throw error
        console.log("[v0] Updated vote for agenda:", agenda_id, "to:", vote_type)
      }
    } else {
      // Create new vote
      const { error } = await supabase.from("agenda_votes").insert({
        agenda_id,
        user_id: user.id,
        vote_type,
      })

      if (error) throw error
      console.log("[v0] Created new vote for agenda:", agenda_id, "type:", vote_type)
    }

    // Get updated vote counts
    const { data: voteCounts } = await supabase.from("agenda_votes").select("vote_type").eq("agenda_id", agenda_id)

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    console.log("[v0] Updated vote counts - Likes:", likes, "Dislikes:", dislikes)

    const response = NextResponse.json({
      success: true,
      likes,
      dislikes,
      userVote: existingVote?.vote_type === vote_type ? null : vote_type,
    })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    return response
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

    console.log("[v0] Fetching votes for agenda ID:", id)

    const validation = await validateAndNormalizeAgendaId(id)
    if (!validation.isValid || !validation.agendaUUID) {
      return NextResponse.json({ error: validation.error || "Invalid agenda ID" }, { status: 400 })
    }

    const agenda_id = validation.agendaUUID

    console.log("[v0] Using agenda UUID for database operations:", agenda_id)

    // Get vote counts using service role to avoid exposing raw rows via public RLS
    const { data: voteCounts, error: voteCountsError } = await svc
      .from("agenda_votes")
      .select("vote_type")
      .eq("agenda_id", agenda_id)

    if (voteCountsError) {
      console.error("[v0] Error fetching vote counts:", voteCountsError)
      throw voteCountsError
    }

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    console.log("[v0] Vote counts - Likes:", likes, "Dislikes:", dislikes)

    // Get user's vote if authenticated (query with service role, filtered by user_id)
    let userVote = null
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: existingVote } = await svc
        .from("agenda_votes")
        .select("vote_type")
        .eq("agenda_id", agenda_id)
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
