'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface Phase {
  phase: string
  title: string
  items: string[]
}

interface PhaseCollapsibleProps {
  phase: Phase
  index: number
}

export function PhaseCollapsible({ phase, index }: PhaseCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
          <div className="flex flex-col items-start gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {phase.phase}
            </Badge>
            <span className="font-semibold text-left">{phase.title}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 pt-2 space-y-3">
          {phase.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
              <ChevronRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
