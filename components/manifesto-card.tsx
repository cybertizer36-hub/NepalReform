"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ExternalLink, Clock, Target, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AgendaVoteSection } from "@/components/agenda-vote-section"
import { useTranslation } from 'react-i18next'
import { ManifestoSummaryItem } from "@/hooks/use-manifesto-data"

interface ManifestoCardProps {
  item: ManifestoSummaryItem
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
    return t(`labels.priority.${priorityKey}`, { defaultValue: priority });
  }

  return (
    <Card className="group w-full border hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className={cn("text-xs", getCategoryColor(item.category))}>
            {item.category}
          </Badge>
          <Badge variant="outline" className={cn("text-xs", getPriorityColor(item.priority))}>
            {getPriorityLabel(item.priority)}
          </Badge>
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            {item.timeline}
          </Badge>
        </div>
        
        <CardTitle className="text-lg sm:text-xl font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {item.title}
        </CardTitle>
        
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-2">
          {item.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Problem Section */}
          <div className="bg-red-50 border-l-4 border-red-300 p-3 sm:p-4 rounded-r">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-red-800 mb-1">
                  {t('sections.theProblem', { defaultValue: 'The Problem' })}
                </p>
                <p className="text-xs sm:text-sm text-red-700 leading-relaxed line-clamp-2">
                  {item.problem.short}
                </p>
              </div>
            </div>
          </div>

          {/* Solutions Section */}
          <div className="bg-green-50 border-l-4 border-green-300 p-3 sm:p-4 rounded-r">
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-green-800 mb-2">
                  {t('sections.keySolutions', { defaultValue: 'Key Solutions' })}
                </p>
                <div className="space-y-1">
                  {item.solution.short.slice(0, 2).map((solution, index) => (
                    <div key={index} className="flex items-start gap-1.5">
                      <div className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-green-700 leading-relaxed line-clamp-1">
                        {solution}
                      </p>
                    </div>
                  ))}
                  {item.solution.short.length > 2 && (
                    <p className="text-xs sm:text-sm text-green-600 font-medium">
                      +{item.solution.short.length - 2} {t('actions.moreSolutions', { defaultValue: 'more solutions' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Targets */}
          <div className="bg-purple-50 border-l-4 border-purple-300 p-3 sm:p-4 rounded-r">
            <div className="flex items-start gap-2 sm:gap-3">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-purple-800 mb-2">
                  {t('sections.keyTargets', { defaultValue: 'Performance Targets' })}
                </p>
                <div className="space-y-1">
                  {item.performanceTargets.slice(0, 2).map((target, index) => (
                    <div key={index} className="flex items-start gap-1.5">
                      <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-purple-700 leading-relaxed line-clamp-1">
                        {target}
                      </p>
                    </div>
                  ))}
                  {item.performanceTargets.length > 2 && (
                    <p className="text-xs sm:text-sm text-purple-600 font-medium">
                      +{item.performanceTargets.length - 2} {t('actions.moreTargets', { defaultValue: 'more targets' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              {/* Real World Evidence */}
              {item.realWorldEvidence.short.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-foreground mb-2 flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    {t('sections.realWorldEvidence', { defaultValue: 'Real World Evidence' })}
                  </h4>
                  <div className="space-y-2">
                    {item.realWorldEvidence.short.map((evidence, index) => (
                      <div key={index} className="text-xs sm:text-sm text-muted-foreground bg-blue-50 p-2 sm:p-3 rounded border-l-2 border-blue-200">
                        {evidence}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Implementation Steps */}
              {item.implementation.short.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-foreground mb-2 flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    {t('sections.implementationOverview', { defaultValue: 'Implementation Steps' })}
                  </h4>
                  <div className="space-y-2">
                    {item.implementation.short.map((step, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground bg-orange-50 p-2 sm:p-3 rounded border-l-2 border-orange-200 flex-1">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Foundation */}
              {item.legalFoundation && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-foreground mb-2 flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    {t('sections.legalFoundation', { defaultValue: 'Legal Foundation' })}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground bg-gray-50 p-3 sm:p-4 rounded border-l-2 border-gray-300">
                    {item.legalFoundation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs p-2 h-8"
            >
              <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", isExpanded && "rotate-180")} />
              {isExpanded ? t('actions.showLess', { defaultValue: 'Less' }) : t('actions.showMore', { defaultValue: 'More' })}
            </Button>
            
            <Link href={`/agenda/${item.id}`}>
              <Button variant="ghost" size="sm" className="text-xs p-2 h-8">
                <ExternalLink className="w-4 h-4 mr-1" />
                {t('actions.fullDetails', { defaultValue: 'Details' })}
              </Button>
            </Link>
          </div>
          
          <div className="flex-shrink-0">
            <AgendaVoteSection agendaId={item.id} size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
