"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, ArrowLeft, Share2, Bookmark, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Opinion {
  id: string
  title: string
  description: string
  problem_statement: string
  category: string
  key_points: string[]
  proposed_solutions?: string[]
  expected_outcomes?: string[]
  stakeholders?: string[]
  implementation_timeline?: string
  tags?: string[]
  references?: string[]
  created_at: string
  updated_at: string
}

interface OpinionDetailProps {
  opinion: Opinion
}

// Add Vote type for votes in agenda_votes
interface Vote {
  vote_type: "like" | "dislike"
  // add other fields if needed
}

export function OpinionDetail({ opinion }: OpinionDetailProps) {
  const [user, setUser] = useState<any>(null)
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null)
  const [voteCounts, setVoteCounts] = useState({ likes: 0, dislikes: 0 })
  const [suggestionCount, setSuggestionCount] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchVoteCounts()
    fetchSuggestionCount()
  }, [opinion.id])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      fetchUserVote(user.id)
    }
  }

  const fetchUserVote = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("agenda_votes")
        .select("vote_type")
        .eq("agenda_id", opinion.id)
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") throw error
      setUserVote(data?.vote_type || null)
    } catch (error) {
      console.error("Error fetching user vote:", error)
    }
  }

  const fetchVoteCounts = async () => {
    try {
      const { data, error }: { data: Vote[] | null; error: any } = await supabase
        .from("agenda_votes")
        .select("vote_type")
        .eq("agenda_id", opinion.id)

      if (error) throw error

      const counts = { likes: 0, dislikes: 0 }
      data?.forEach((vote: Vote) => {
        if (vote.vote_type === "like") counts.likes++
        else if (vote.vote_type === "dislike") counts.dislikes++
      })

      setVoteCounts(counts)
    } catch (error) {
      console.error("Error fetching vote counts:", error)
    }
  }

  const fetchSuggestionCount = async () => {
    try {
      const { count, error } = await supabase
        .from("suggestions")
        .select("*", { count: "exact", head: true })
        .eq("agenda_id", opinion.id)

      if (error) throw error
      setSuggestionCount(count || 0)
    } catch (error) {
      console.error("Error fetching suggestion count:", error)
    }
  }

  const handleVote = async (voteType: "like" | "dislike") => {
    if (!user) {
      window.location.href = "/auth/login"
      return
    }

    try {
      if (userVote === voteType) {
        // Remove vote if clicking the same vote type
        const { error } = await supabase
          .from("agenda_votes")
          .delete()
          .eq("agenda_id", opinion.id)
          .eq("user_id", user.id)

        if (error) throw error

        setUserVote(null)
        setVoteCounts((prev) => ({
          ...prev,
          [voteType === "like" ? "likes" : "dislikes"]: Math.max(
            0,
            prev[voteType === "like" ? "likes" : "dislikes"] - 1,
          ),
        }))
      } else {
        // Insert or update vote
        const { error } = await supabase.from("agenda_votes").upsert({
          agenda_id: opinion.id,
          user_id: user.id,
          vote_type: voteType,
        })

        if (error) throw error

        // Update local state
        const oldVote = userVote
        setUserVote(voteType)

        setVoteCounts((prev) => {
          const newCounts = { ...prev }

          // If there was a previous vote, decrease that count
          if (oldVote) {
            newCounts[oldVote === "like" ? "likes" : "dislikes"] = Math.max(
              0,
              newCounts[oldVote === "like" ? "likes" : "dislikes"] - 1,
            )
          }

          // Increase the new vote count
          newCounts[voteType === "like" ? "likes" : "dislikes"]++

          return newCounts
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Governance: "bg-orange-100 text-orange-800 border-orange-200",
      Democracy: "bg-blue-100 text-blue-800 border-blue-200",
      Justice: "bg-purple-100 text-purple-800 border-purple-200",
      Federalism: "bg-green-100 text-green-800 border-green-200",
      Administration: "bg-slate-100 text-slate-800 border-slate-200",
      Economy: "bg-amber-100 text-amber-800 border-amber-200",
      Education: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Healthcare: "bg-red-100 text-red-800 border-red-200",
      Infrastructure: "bg-cyan-100 text-cyan-800 border-cyan-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const ArraySection = ({ title, items, icon }: { title: string; items?: string[]; icon?: React.ReactNode }) => {
    if (!items || items.length === 0) return null

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/opinions">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opinions
        </Link>
      </Button>

      {/* Main Opinion Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className={cn("text-xs font-medium", getCategoryColor(opinion.category))}>
                  {opinion.category}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(opinion.created_at)}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium bg-green-100 text-green-800 border-green-200">
                  <User className="w-3 h-3 mr-1" />
                  Community Opinion
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground leading-tight mb-4">{opinion.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant={userVote === "like" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("like")}
              className={cn(
                "flex items-center gap-2 transition-colors",
                userVote === "like" && "bg-green-600 hover:bg-green-700 text-white",
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{voteCounts.likes} Likes</span>
            </Button>

            <Button
              variant={userVote === "dislike" ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleVote("dislike")}
              className="flex items-center gap-2 transition-colors"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{voteCounts.dislikes} Dislikes</span>
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{suggestionCount} Suggestions</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Overview</h4>
            <p className="text-foreground leading-relaxed text-base">{opinion.description}</p>
          </div>

          {/* Problem Statement */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Problem Statement</h4>
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-l-destructive">
              <p className="text-foreground leading-relaxed">{opinion.problem_statement}</p>
            </div>
          </div>

          {/* Key Points */}
          <ArraySection title="Key Points" items={opinion.key_points} />

          {/* Proposed Solutions */}
          <ArraySection title="Proposed Solutions" items={opinion.proposed_solutions} />

          {/* Expected Outcomes */}
          <ArraySection title="Expected Outcomes" items={opinion.expected_outcomes} />

          {/* Implementation Timeline */}
          {opinion.implementation_timeline && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Implementation Timeline
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-l-blue-500">
                <p className="text-foreground leading-relaxed">{opinion.implementation_timeline}</p>
              </div>
            </div>
          )}

          {/* Stakeholders */}
          <ArraySection title="Key Stakeholders" items={opinion.stakeholders} />

          {/* Tags */}
          {opinion.tags && opinion.tags.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {opinion.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {opinion.references && opinion.references.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">References</h4>
              <ul className="space-y-2">
                {opinion.references.map((ref, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {ref}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
