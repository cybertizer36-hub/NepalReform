"use client"

import { useState, useMemo, useEffect } from "react"
import { ManifestoCard } from "./manifesto-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Search, X, RotateCcw, SlidersHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { manifestoData, getAllCategories } from "@/lib/manifesto-data"

interface FilterState {
  searchQuery: string
  selectedCategories: string[]
  selectedPriorities: string[]
  timelineRange: [number, number]
  showAdvancedFilters: boolean
}

export function ManifestoList() {
  const [randomSeed, setRandomSeed] = useState(0)

  useEffect(() => {
    setRandomSeed(Math.random())
  }, [])

  const timelineValues = useMemo(() => {
    const timelines = manifestoData.map((item) => {
      const match = item.timeline.match(/(\d+)/)
      return match ? Number.parseInt(match[1]) : 1
    })
    return [Math.min(...timelines), Math.max(...timelines)]
  }, [])

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    selectedCategories: [],
    selectedPriorities: [],
    timelineRange: [timelineValues[0], timelineValues[1]],
    showAdvancedFilters: false,
  })

  const categories = getAllCategories()
  const priorities = ["High", "Medium", "Low"]

  const shuffleArray = <T,>(array: T[], seed: number): T[] => {
    const shuffled = [...array]
    let currentIndex = shuffled.length
    let randomIndex: number

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    while (currentIndex !== 0) {
      randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex)
      currentIndex--
      ;[shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]]
    }

    return shuffled
  }

  const filteredItems = useMemo(() => {
    const filtered = manifestoData.filter((item) => {
      // Search query filter
      const searchMatch =
        filters.searchQuery === "" ||
        item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.problem.short.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.problem.long.toLowerCase().includes(filters.searchQuery.toLowerCase())

      // Category filter
      const categoryMatch =
        filters.selectedCategories.length === 0 || filters.selectedCategories.includes(item.category)

      // Priority filter
      const priorityMatch =
        filters.selectedPriorities.length === 0 || filters.selectedPriorities.includes(item.priority)

      // Timeline filter
      const timelineMatch = (() => {
        const match = item.timeline.match(/(\d+)/)
        const timelineYears = match ? Number.parseInt(match[1]) : 1
        return timelineYears >= filters.timelineRange[0] && timelineYears <= filters.timelineRange[1]
      })()

      return searchMatch && categoryMatch && priorityMatch && timelineMatch
    })

    return shuffleArray(filtered, randomSeed)
  }, [filters, randomSeed])

  const updateSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
  }

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category],
    }))
  }

  const togglePriority = (priority: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedPriorities: prev.selectedPriorities.includes(priority)
        ? prev.selectedPriorities.filter((p) => p !== priority)
        : [...prev.selectedPriorities, priority],
    }))
  }

  const updateTimelineRange = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, timelineRange: range }))
  }

  const clearAllFilters = () => {
    setFilters({
      searchQuery: "",
      selectedCategories: [],
      selectedPriorities: [],
      timelineRange: [timelineValues[0], timelineValues[1]],
      showAdvancedFilters: false,
    })
  }

  const toggleAdvancedFilters = () => {
    setFilters((prev) => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }))
  }

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.selectedCategories.length > 0 ||
    filters.selectedPriorities.length > 0 ||
    filters.timelineRange[0] !== timelineValues[0] ||
    filters.timelineRange[1] !== timelineValues[1]

  return (
    <div className="space-y-6">
      <div className="space-y-4 bg-card/50 p-6 rounded-lg border">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reform proposals..."
            value={filters.searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Quick Filters:</span>
          </div>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={filters.selectedCategories.length > 0 ? "default" : "outline"}
                size="sm"
                className="relative"
              >
                Categories
                {filters.selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                    {filters.selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem key={category} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <span>{category}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={filters.selectedPriorities.length > 0 ? "default" : "outline"}
                size="sm"
                className="relative"
              >
                Priority
                {filters.selectedPriorities.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                    {filters.selectedPriorities.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Priority Levels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {priorities.map((priority) => (
                <DropdownMenuItem key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.selectedPriorities.includes(priority)}
                    onCheckedChange={() => togglePriority(priority)}
                  />
                  <span className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        priority === "High" ? "bg-red-500" : priority === "Medium" ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    />
                    {priority} Priority
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAdvancedFilters}
            className="flex items-center gap-2 bg-transparent"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        <Collapsible open={filters.showAdvancedFilters}>
          <CollapsibleContent className="space-y-4 pt-4 border-t">
            {/* Timeline Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Implementation Timeline</label>
                <span className="text-sm text-muted-foreground">
                  {filters.timelineRange[0]} - {filters.timelineRange[1]} years
                </span>
              </div>
              <Slider
                value={filters.timelineRange}
                onValueChange={(value) => updateTimelineRange(value as [number, number])}
                max={timelineValues[1]}
                min={timelineValues[0]}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {timelineValues[0]} year{timelineValues[0] !== 1 ? "s" : ""}
                </span>
                <span>{timelineValues[1]} years</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.searchQuery && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Search: "{filters.searchQuery}"
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => updateSearchQuery("")} />
              </Badge>
            )}

            {filters.selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs flex items-center gap-1">
                {category}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => toggleCategory(category)} />
              </Badge>
            ))}

            {filters.selectedPriorities.map((priority) => (
              <Badge key={priority} variant="secondary" className="text-xs flex items-center gap-1">
                {priority} Priority
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => togglePriority(priority)} />
              </Badge>
            ))}

            {(filters.timelineRange[0] !== timelineValues[0] || filters.timelineRange[1] !== timelineValues[1]) && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Timeline: {filters.timelineRange[0]}-{filters.timelineRange[1]} years
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => updateTimelineRange([timelineValues[0], timelineValues[1]])}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {manifestoData.length} reform proposals
          {hasActiveFilters && " (filtered)"}
        </p>

        {filteredItems.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              High: {filteredItems.filter((item) => item.priority === "High").length}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              Medium: {filteredItems.filter((item) => item.priority === "Medium").length}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Low: {filteredItems.filter((item) => item.priority === "Low").length}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {filteredItems.map((item) => (
          <ManifestoCard key={item.id} item={item} />
        ))}
      </div>

      {/* No Results State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No reform proposals found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "No reform proposals are currently available."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters} className="mt-4 bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
