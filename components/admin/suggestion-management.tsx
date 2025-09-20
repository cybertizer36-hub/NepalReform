"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, X, Eye, MessageSquare, Search, CheckSquare, XSquare } from "lucide-react"
import { toast } from "sonner"

export interface Suggestion {
  id: string
  content: string
  author_name: string
  category?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  agenda_id?: string
  user_id: string
  profiles: {
    email: string
    full_name: string | null
  }
  agendas?: {
    title: string
  }
}

export function SuggestionManagement() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const supabase = createClient()

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false })

      if (suggestionsError) throw suggestionsError

      // Fetch profiles separately
      const userIds = [...new Set(suggestionsData?.map((s: Suggestion) => s.user_id).filter(Boolean))]
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds)

      if (profilesError) throw profilesError

      // Fetch agendas separately
      const agendaIds = [...new Set(suggestionsData?.map((s: Suggestion) => s.agenda_id).filter(Boolean))]
      const { data: agendasData, error: agendasError } = await supabase
        .from("agendas")
        .select("id, title")
        .in("id", agendaIds)

      if (agendasError) throw agendasError

      // Create lookup maps
      const profilesMap = new Map(
        profilesData?.map((p: { id: string; email: string; full_name: string | null }) => [p.id, p]) || [],
      )
      const agendasMap = new Map(agendasData?.map((a: { id: string; title: string }) => [a.id, a]) || [])

      // Join the data manually
      const joinedData =
        suggestionsData?.map((suggestion: Suggestion) => ({
          ...suggestion,
          status: suggestion.status || "pending", // Default status if not set
          profiles: suggestion.user_id ? profilesMap.get(suggestion.user_id) : null,
          agendas: suggestion.agenda_id ? agendasMap.get(suggestion.agenda_id) : null,
        })) || []

      setSuggestions(joinedData)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      toast.error("Failed to fetch suggestions")
    } finally {
      setLoading(false)
    }
  }

  const logActivity = async (action: string, resourceType: string, resourceId?: string, details?: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("No authenticated user found for activity logging")
        return
      }

      const { error } = await supabase.from("activity_logs").insert([
        {
          user_id: user.id, // Added user_id to satisfy RLS policy
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  const updateSuggestionStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("suggestions").update({ status }).eq("id", id)

      if (error) throw error

      setSuggestions(suggestions.map((suggestion) => (suggestion.id === id ? { ...suggestion, status } : suggestion)))

      // Log the activity
      await logActivity(`suggestion_${status}`, "suggestion", id, { status })

      toast.success(`Suggestion ${status} successfully`)
    } catch (error) {
      console.error("Error updating suggestion:", error)
      toast.error("Failed to update suggestion")
    }
  }

  const handleBulkAction = async (action: "approve" | "reject" | "delete") => {
    if (selectedItems.length === 0) {
      toast.error("Please select items to perform bulk action")
      return
    }

    try {
      if (action === "delete") {
        const { error } = await supabase.from("suggestions").delete().in("id", selectedItems)
        if (error) throw error

        setSuggestions(suggestions.filter((s) => !selectedItems.includes(s.id)))
        await logActivity("bulk_delete_suggestions", "suggestion", undefined, { count: selectedItems.length })
        toast.success(`${selectedItems.length} suggestions deleted`)
      } else {
        const status = action === "approve" ? "approved" : "rejected"
        const { error } = await supabase.from("suggestions").update({ status }).in("id", selectedItems)
        if (error) throw error

        setSuggestions(
          suggestions.map((s) =>
            selectedItems.includes(s.id) ? { ...s, status: status as "approved" | "rejected" } : s,
          ),
        )
        await logActivity(`bulk_${action}_suggestions`, "suggestion", undefined, { count: selectedItems.length })
        toast.success(`${selectedItems.length} suggestions ${status}`)
      }

      setSelectedItems([])
    } catch (error) {
      console.error("Error performing bulk action:", error)
      toast.error("Failed to perform bulk action")
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredSuggestions.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredSuggestions.map((s) => s.id))
    }
  }

  const filteredSuggestions = suggestions.filter((suggestion) => {
    const matchesSearch =
      suggestion.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || suggestion.status === statusFilter
    const matchesCategory = categoryFilter === "all" || suggestion.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending")
  const approvedSuggestions = suggestions.filter((s) => s.status === "approved")
  const rejectedSuggestions = suggestions.filter((s) => s.status === "rejected")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Content Management</h2>
        <p className="text-muted-foreground">Review, moderate, and manage user-generated content</p>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suggestions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("approve")}
              className="text-green-600 hover:text-green-700"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Approve ({selectedItems.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("reject")}
              className="text-red-600 hover:text-red-700"
            >
              <XSquare className="h-4 w-4 mr-2" />
              Reject ({selectedItems.length})
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">Moderated content</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Suggestions</CardTitle>
          <CardDescription>Review and moderate user suggestions with bulk actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading suggestions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredSuggestions.length && filteredSuggestions.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Related Agenda</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(suggestion.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, suggestion.id])
                          } else {
                            setSelectedItems(selectedItems.filter((id) => id !== suggestion.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={suggestion.content}>
                        {suggestion.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      {suggestion.agendas?.title ? (
                        <Badge variant="outline" className="text-xs">
                          {suggestion.agendas.title}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {suggestion.profiles?.full_name || suggestion.profiles?.email || suggestion.author_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(suggestion.status)}>
                        {suggestion.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(suggestion.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedSuggestion(suggestion)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Suggestion Details</DialogTitle>
                              <DialogDescription>
                                Submitted by{" "}
                                {selectedSuggestion?.profiles?.full_name ||
                                  selectedSuggestion?.profiles?.email ||
                                  selectedSuggestion?.author_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {selectedSuggestion?.agendas?.title && (
                                <div>
                                  <h4 className="font-medium mb-2">Related Agenda</h4>
                                  <Badge variant="outline">{selectedSuggestion.agendas.title}</Badge>
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium mb-2">Content</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                  {selectedSuggestion?.content}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Status</h4>
                                <Badge variant="outline" className={getStatusColor(selectedSuggestion?.status || "")}>
                                  {selectedSuggestion?.status}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                {selectedSuggestion?.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (selectedSuggestion) {
                                          updateSuggestionStatus(selectedSuggestion.id, "approved")
                                          setSelectedSuggestion(null)
                                        }
                                      }}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        if (selectedSuggestion) {
                                          updateSuggestionStatus(selectedSuggestion.id, "rejected")
                                          setSelectedSuggestion(null)
                                        }
                                      }}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {suggestion.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSuggestionStatus(suggestion.id, "approved")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSuggestionStatus(suggestion.id, "rejected")}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}