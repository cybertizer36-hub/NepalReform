"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ExternalLink, Clock, Target, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AgendaVoteSection } from "@/components/agenda-vote-section"
import { useTranslation } from 'react-i18next'
import { ManifestoItem } from "@/hooks/use-manifesto-data"

interface ManifestoCardProps {
  item: ManifestoItem
}

export function ManifestoCard({ item }: ManifestoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation('common')

  const getCategoryColor = (category: string) => {
    const colors = {
      "Anti-Corruption": "bg-red-100 text-red-800 border-red-200",
      "Electoral Reform": "bg-blue-100 text-blue-800 border-blue-200",
      Federalism: "bg-green-100 text-green-800 border-green-200",
      Transparency: "bg-purple-100 text-purple-800 border-purple-200",
      Governance: "bg-orange-100 text-orange-800 border-orange-200",
      "Constitutional Reform": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Digital Governance": "bg-teal-100 text-teal-800 border-teal-200",
      "Procurement Reform": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Competition Policy": "bg-pink-100 text-pink-800 border-pink-200",
      Transportation: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Education: "bg-lime-100 text-lime-800 border-lime-200",
      "Economic Development": "bg-amber-100 text-amber-800 border-amber-200",
      "Education Reform": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Security Reform": "bg-slate-100 text-slate-800 border-slate-200",
      "Investment Policy": "bg-violet-100 text-violet-800 border-violet-200",
      "Civil Service Reform": "bg-rose-100 text-rose-800 border-rose-200",
      "Judicial Reform": "bg-sky-100 text-sky-800 border-sky-200",
      "Financial Transparency": "bg-stone-100 text-stone-800 border-stone-200",
      "Public Administration": "bg-neutral-100 text-neutral-800 border-neutral-200",
      Healthcare: "bg-red-100 text-red-800 border-red-200",
      "Social Protection": "bg-blue-100 text-blue-800 border-blue-200",
      "Financial Management": "bg-green-100 text-green-800 border-green-200",
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

  // Get localized priority label
  const getPriorityLabel = (priority: string) => {
    const priorityKey = priority.toLowerCase() as 'high' | 'medium' | 'low';
    return t(`labels.priority.${priorityKey}`);
  }

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className={cn("text-xs font-medium", getCategoryColor(item.category))}>
                {item.category}
              </Badge>
              <Badge variant="outline" className={cn("text-xs font-medium", getPriorityColor(item.priority))}>
                {getPriorityLabel(item.priority)} {t('labels.priority.label')}
              </Badge>
              <Badge variant="outline" className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                {item.timeline}
              </Badge>
            </div>
            <CardTitle className="text-xl leading-tight text-foreground">
              {item.title}
            </CardTitle>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Problem (SHORT VERSION) */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <X className="w-4 h-4 text-destructive" />
            {t('sections.theProblem')}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {item.problem.short}
          </p>
        </div>

        {/* Solutions (SHORT VERSION) */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            {t('sections.keySolutions')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {item.solution.short.slice(0, 3).map((solution, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="line-clamp-2">{solution}</span>
              </li>
            ))}
            {item.solution.short.length > 3 && (
              <li className="text-xs text-muted-foreground/70 italic pl-4">
                +{item.solution.short.length - 3} {t('actions.moreSolutions')}
              </li>
            )}
          </ul>
        </div>

        {/* Performance Targets (LIMITED) */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            {t('sections.keyTargets')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {item.performanceTargets.slice(0, 2).map((target, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-normal">
                {target.length > 50 ? target.substring(0, 50) + "..." : target}
              </Badge>
            ))}
            {item.performanceTargets.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.performanceTargets.length - 2} {t('actions.moreTargets')}
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Real World Evidence (SHORT VERSION) */}
            <div>
              <h4 className="font-semibold text-sm mb-2">{t('sections.realWorldEvidence')}</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                {item.realWorldEvidence.short.map((evidence, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Implementation Timeline (SHORT VERSION) */}
            <div>
              <h4 className="font-semibold text-sm mb-2">{t('sections.implementationOverview')}</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                {item.implementation.short.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium text-primary">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Foundation */}
            {item.legalFoundation && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t('sections.legalFoundation')}</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  {item.legalFoundation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2 flex-col items-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              <ChevronDown
                className={cn("w-4 h-4 mr-1 transition-transform", isExpanded && "rotate-180")}
              />
              {isExpanded ? t('actions.showLess') : t('actions.showMore')}
            </Button>
            <Link href={`/agenda/${item.id}`}>
              <Button variant="ghost" size="sm" className="text-xs">
                <ExternalLink className="w-4 h-4 mr-1" />
                {t('actions.fullDetails')}
              </Button>
            </Link>
          </div>
          <AgendaVoteSection agendaId={item.id} size="sm" />
        </div>
      </CardContent>
    </Card>
  )
}
