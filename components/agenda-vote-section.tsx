"use client"

import { VoteButtons } from "@/components/vote-buttons"
import { useAgendaVotes } from "@/hooks/use-agenda-votes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingUp, Users, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ClientOnly } from "@/components/client-only"

interface AgendaVoteSectionProps {
  agendaId: string
  className?: string
  size?: "sm" | "default"
}

export function AgendaVoteSection({ agendaId, className, size = "sm" }: AgendaVoteSectionProps) {
  const { voteData, handleVote, isLoading, error } = useAgendaVotes(agendaId)

  const onVote = async (itemId: string, voteType: "like" | "dislike") => {
    await handleVote(voteType)
  }

  const totalVotes = voteData.likes + voteData.dislikes
  const likePercentage = totalVotes > 0 ? Math.round((voteData.likes / totalVotes) * 100) : 0
  const dislikePercentage = totalVotes > 0 ? Math.round((voteData.dislikes / totalVotes) * 100) : 0
  const isPopular = voteData.likes > voteData.dislikes && voteData.likes > 0
  const isControversial = totalVotes > 10 && Math.abs(voteData.likes - voteData.dislikes) <= 2
  const isHighlyEngaged = totalVotes >= 50

  // Fallback component for hydration
  const VotingSectionFallback = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-16 h-8 animate-pulse bg-gray-200 rounded" />
          <div className="w-16 h-8 animate-pulse bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-2 animate-pulse bg-gray-200 rounded-full" />
      </div>
    </div>
  )

  return (
    <div className={className}>
      <ClientOnly fallback={<VotingSectionFallback />}>
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {/* Vote Buttons with loading state */}
          <div className="flex items-center gap-2">
            <VoteButtons
              itemId={agendaId}
              userVote={voteData.userVote}
              likesCount={voteData.likes}
              dislikesCount={voteData.dislikes}
              onVote={onVote}
              size={size}
              isLoading={isLoading}
            />

            {isLoading && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Updating...</span>
              </div>
            )}
          </div>

          {/* Vote Statistics and Badges */}
          {totalVotes > 0 && (
            <div className="space-y-2">
              {/* Vote Bar Visualization */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="text-green-600 font-medium">{likePercentage}% like</span>
                  <span className="text-red-600 font-medium">{dislikePercentage}% dislike</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-600 transition-all duration-500 ease-out"
                    style={{ width: `${likePercentage}%` }}
                  />
                  <div 
                    className="bg-red-600 transition-all duration-500 ease-out"
                    style={{ width: `${dislikePercentage}%` }}
                  />
                </div>
              </div>

              {/* Engagement Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                </Badge>

                {isPopular && (
                  <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}

                {isControversial && (
                  <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                    ⚡ Controversial
                  </Badge>
                )}

                {isHighlyEngaged && (
                  <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                    🔥 High Engagement
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* No votes yet message */}
          {totalVotes === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground italic">
              Be the first to vote on this agenda!
            </p>
          )}
        </div>
      </ClientOnly>
    </div>
  )
}
