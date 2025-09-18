"use client"

import { useState, useMemo } from "react"
import { manifestoData, type ManifestoItem } from "@/lib/manifesto-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, Search, Filter, ChevronRight, Clock, Target, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AgendaManagement() {
  const [selectedAgenda, setSelectedAgenda] = useState<ManifestoItem | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")

  // Get unique categories from manifesto data
  const categories = useMemo(() => {
    const cats = new Set(manifestoData.map(item => item.category))
    return ["all", ...Array.from(cats)]
  }, [])

  // Filter agendas based on search and filters
  const filteredAgendas = useMemo(() => {
    return manifestoData.filter(agenda => {
      const matchesSearch = searchQuery === "" || 
        agenda.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agenda.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || agenda.category === selectedCategory
      const matchesPriority = selectedPriority === "all" || agenda.priority === selectedPriority
      
      return matchesSearch && matchesCategory && matchesPriority
    })
  }, [searchQuery, selectedCategory, selectedPriority])

  const handleView = (agenda: ManifestoItem) => {
    setSelectedAgenda(agenda)
    setIsViewDialogOpen(true)
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800 border-red-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Low: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Anti-Corruption": "bg-purple-100 text-purple-800",
      "Electoral Reform": "bg-blue-100 text-blue-800",
      "Federalism": "bg-green-100 text-green-800",
      "Transparency": "bg-yellow-100 text-yellow-800",
      "Governance": "bg-indigo-100 text-indigo-800",
      "Digital Governance": "bg-cyan-100 text-cyan-800",
      "Procurement Reform": "bg-orange-100 text-orange-800",
      "Competition Policy": "bg-pink-100 text-pink-800",
      "Transportation": "bg-teal-100 text-teal-800",
      "Education": "bg-violet-100 text-violet-800",
      "Economic Development": "bg-amber-100 text-amber-800",
      "Education Reform": "bg-rose-100 text-rose-800",
      "Security Reform": "bg-slate-100 text-slate-800",
      "Investment Policy": "bg-lime-100 text-lime-800",
      "Constitutional Reform": "bg-red-100 text-red-800",
      "Civil Service Reform": "bg-emerald-100 text-emerald-800",
      "Judicial Reform": "bg-sky-100 text-sky-800",
      "Financial Transparency": "bg-fuchsia-100 text-fuchsia-800",
      "Public Administration": "bg-stone-100 text-stone-800",
      "Healthcare": "bg-blue-100 text-blue-800",
      "Social Protection": "bg-purple-100 text-purple-800",
      "Financial Management": "bg-indigo-100 text-indigo-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reform Agenda Management</h2>
        <p className="text-muted-foreground">View and analyze the 27 comprehensive reform proposals</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search Agendas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manifestoData.length}</div>
            <p className="text-xs text-muted-foreground">Comprehensive proposals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {manifestoData.filter(a => a.priority === "High").length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent reforms needed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground">Different reform areas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAgendas.length}</div>
            <p className="text-xs text-muted-foreground">Matching criteria</p>
          </CardContent>
        </Card>
      </div>

      {/* Agendas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reform Agendas ({filteredAgendas.length})</CardTitle>
          <CardDescription>Click on any reform to view detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgendas.map((agenda) => (
                  <TableRow key={agenda.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{agenda.id}</TableCell>
                    <TableCell>
                      <div className="max-w-[400px]">
                        <p className="font-medium line-clamp-1">{agenda.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {agenda.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryColor(agenda.category)}>
                        {agenda.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(agenda.priority)}>
                        {agenda.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{agenda.timeline}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleView(agenda)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedAgenda?.title}</DialogTitle>
            <DialogDescription className="mt-2">
              {selectedAgenda?.description}
            </DialogDescription>
            <div className="flex gap-2 mt-3">
              <Badge className={getCategoryColor(selectedAgenda?.category || "")}>
                {selectedAgenda?.category}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(selectedAgenda?.priority || "")}>
                {selectedAgenda?.priority} Priority
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {selectedAgenda?.timeline}
              </Badge>
            </div>
          </DialogHeader>

          {selectedAgenda && (
            <ScrollArea className="h-[600px] pr-4">
              <Tabs defaultValue="problem" className="mt-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="problem">Problem</TabsTrigger>
                  <TabsTrigger value="solution">Solution</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  <TabsTrigger value="implementation">Implementation</TabsTrigger>
                  <TabsTrigger value="targets">Targets</TabsTrigger>
                </TabsList>

                <TabsContent value="problem" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Problem Summary</h3>
                    <p className="text-sm text-muted-foreground">{selectedAgenda.problem.short}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Detailed Problem Analysis</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedAgenda.problem.long}
                    </p>
                  </div>
                  {selectedAgenda.legalFoundation && (
                    <div>
                      <h3 className="font-semibold mb-2">Legal Foundation</h3>
                      <p className="text-sm text-muted-foreground">{selectedAgenda.legalFoundation}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="solution" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Solutions</h3>
                    <ul className="space-y-2">
                      {selectedAgenda.solution.short.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Implementation Phases</h3>
                    <div className="space-y-4">
                      {selectedAgenda.solution.long.phases.map((phase, idx) => (
                        <Card key={idx}>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              {phase.phase}: {phase.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {phase.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="text-sm text-muted-foreground">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="evidence" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Evidence Points</h3>
                    <ul className="space-y-2">
                      {selectedAgenda.realWorldEvidence.short.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Globe className="h-4 w-4 text-primary mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Detailed Country Evidence</h3>
                    <div className="space-y-3">
                      {selectedAgenda.realWorldEvidence.long.map((evidence, idx) => (
                        <Card key={idx}>
                          <CardHeader>
                            <CardTitle className="text-sm">{evidence.country}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm"><strong>Details:</strong> {evidence.details}</p>
                            <p className="text-sm"><strong>Impact:</strong> {evidence.impact}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Quick Implementation Steps</h3>
                    <ul className="space-y-2">
                      {selectedAgenda.implementation.short.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Detailed Implementation Timeline</h3>
                    <div className="space-y-3">
                      {selectedAgenda.implementation.long.map((impl, idx) => (
                        <Card key={idx}>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {impl.timeline}
                            </CardTitle>
                            <CardDescription>{impl.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {impl.details.map((detail, detailIdx) => (
                                <li key={detailIdx} className="text-sm text-muted-foreground">
                                  • {detail}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="targets" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Performance Targets</h3>
                    <div className="grid gap-3">
                      {selectedAgenda.performanceTargets.map((target, idx) => (
                        <Card key={idx}>
                          <CardContent className="flex items-start gap-3 pt-6">
                            <Target className="h-5 w-5 text-primary mt-0.5" />
                            <p className="text-sm">{target}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
