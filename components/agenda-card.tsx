"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { AgendaVoteSection } from "@/components/agenda-vote-section"

interface AgendaCardProps {
  agenda: {
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
}

export function AgendaCard({ agenda }: AgendaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getCategoryColor = (category: string) => {
    const colors = {
      Governance: "bg-blue-100 text-blue-800 border-blue-200",
      Democracy: "bg-green-100 text-green-800 border-green-200",
      Justice: "bg-purple-100 text-purple-800 border-purple-200",
      Federalism: "bg-orange-100 text-orange-800 border-orange-200",
      Administration: "bg-teal-100 text-teal-800 border-teal-200",
      Economy: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Education: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Healthcare: "bg-pink-100 text-pink-800 border-pink-200",
      Infrastructure: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800 border-red-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Low: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800 border-gray-200",
      "Under Review": "bg-blue-100 text-blue-800 border-blue-200",
      Approved: "bg-green-100 text-green-800 border-green-200",
      Implemented: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs font-medium", getCategoryColor(agenda.category))}>
                {agenda.category}
              </Badge>
              <Badge variant="outline" className={cn("text-xs font-medium", getPriorityColor(agenda.priority_level))}>
                {agenda.priority_level} Priority
              </Badge>
              <Badge variant="outline" className={cn("text-xs font-medium", getStatusColor(agenda.status))}>
                {agenda.status}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-foreground leading-tight">{agenda.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="shrink-0 h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Key Points - Always Visible */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Points</h4>
          <ul className="space-y-1">
            {agenda.key_points.slice(0, 3).map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
            {agenda.key_points.length > 3 && !isExpanded && (
              <li className="text-sm text-muted-foreground italic">+{agenda.key_points.length - 3} more points...</li>
            )}
          </ul>
        </div>

        {agenda.tags && agenda.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {agenda.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {agenda.tags.length > 4 && !isExpanded && (
              <Badge variant="secondary" className="text-xs">
                +{agenda.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Problem Statement - Always shown when expanded */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Problem Statement</h4>
            <p className="text-foreground leading-relaxed bg-muted/50 p-4 rounded-lg border-l-2 border-l-destructive">
              {agenda.problem_statement}
            </p>
          </div>

          {/* Complete Key Points */}
          {agenda.key_points.length > 3 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Key Points</h4>
              <ul className="space-y-2">
                {agenda.key_points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {agenda.proposed_solutions && agenda.proposed_solutions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Proposed Solutions
              </h4>
              <ul className="space-y-2">
                {agenda.proposed_solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 shrink-0" />
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Detailed Description
            </h4>
            <p className="text-foreground leading-relaxed">{agenda.description}</p>
          </div>

          {agenda.implementation_timeline && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Implementation Timeline
              </h4>
              <p className="text-foreground leading-relaxed bg-blue-50 p-4 rounded-lg border-l-2 border-l-blue-500">
                {agenda.implementation_timeline}
              </p>
            </div>
          )}

          {agenda.expected_outcomes && agenda.expected_outcomes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Expected Outcomes</h4>
              <ul className="space-y-2">
                {agenda.expected_outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {agenda.stakeholders && agenda.stakeholders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Stakeholders</h4>
              <div className="flex flex-wrap gap-2">
                {agenda.stakeholders.map((stakeholder, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {stakeholder}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {agenda.tags && agenda.tags.length > 4 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Tags</h4>
              <div className="flex flex-wrap gap-2">
                {agenda.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {agenda.references && agenda.references.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">References</h4>
              <ul className="space-y-2">
                {agenda.references.map((reference, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <ExternalLink className="h-3 w-3 mt-1 shrink-0 text-muted-foreground" />
                    <a
                      href={reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {reference}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}

      {/* Voting Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between pt-4 border-t">
          <AgendaVoteSection agendaId={agenda.id} size="sm" />

          <div className="text-xs text-muted-foreground">
            {new Date(agenda.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
