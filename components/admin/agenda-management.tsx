"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Agenda {
  id: string
  title: string
  description: string
  category: string
  priority_level: string
  status: string
  created_at: string
  problem_statement: string
  key_points: string[]
  proposed_solutions: string[]
  expected_outcomes: string[]
  stakeholders: string[]
  implementation_timeline: string
  tags: string[]
  references: string[]
}

export function AgendaManagement() {
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problem_statement: "",
    category: "",
    priority_level: "Medium",
    status: "Draft",
    key_points: "",
    proposed_solutions: "",
    expected_outcomes: "",
    stakeholders: "",
    implementation_timeline: "",
    tags: "",
    references: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchAgendas()
  }, [])

  const fetchAgendas = async () => {
    try {
      const { data, error } = await supabase.from("agendas").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setAgendas(data || [])
    } catch (error) {
      console.error("Error fetching agendas:", error)
      toast.error("Failed to fetch agendas")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const agendaData = {
        ...formData,
        key_points: formData.key_points.split("\n").filter((point) => point.trim()),
        proposed_solutions: formData.proposed_solutions.split("\n").filter((solution) => solution.trim()),
        expected_outcomes: formData.expected_outcomes.split("\n").filter((outcome) => outcome.trim()),
        stakeholders: formData.stakeholders
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        references: formData.references.split("\n").filter((ref) => ref.trim()),
      }

      if (editingAgenda) {
        const { error } = await supabase.from("agendas").update(agendaData).eq("id", editingAgenda.id)

        if (error) throw error
        toast.success("Agenda updated successfully")
      } else {
        const { error } = await supabase.from("agendas").insert([agendaData])

        if (error) throw error
        toast.success("Agenda created successfully")
      }

      setIsCreateDialogOpen(false)
      setEditingAgenda(null)
      resetForm()
      fetchAgendas()
    } catch (error) {
      console.error("Error saving agenda:", error)
      toast.error("Failed to save agenda")
    }
  }

  const handleEdit = async (agenda: Agenda) => {
    setEditingAgenda(agenda)

    try {
      const { data, error } = await supabase.from("agendas").select("*").eq("id", agenda.id).single()

      if (error) throw error

      // Populate form with complete agenda data
      setFormData({
        title: data.title || "",
        description: data.description || "",
        problem_statement: data.problem_statement || "",
        category: data.category || "",
        priority_level: data.priority_level || "Medium",
        status: data.status || "Draft",
        key_points: Array.isArray(data.key_points) ? data.key_points.join("\n") : data.key_points || "",
        proposed_solutions: Array.isArray(data.proposed_solutions)
          ? data.proposed_solutions.join("\n")
          : data.proposed_solutions || "",
        expected_outcomes: Array.isArray(data.expected_outcomes)
          ? data.expected_outcomes.join("\n")
          : data.expected_outcomes || "",
        stakeholders: Array.isArray(data.stakeholders) ? data.stakeholders.join(", ") : data.stakeholders || "",
        implementation_timeline: data.implementation_timeline || "",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
        references: Array.isArray(data.references) ? data.references.join("\n") : data.references || "",
      })

      setIsCreateDialogOpen(true)
    } catch (error) {
      console.error("Error fetching agenda details:", error)
      toast.error("Failed to load agenda details")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agenda?")) return

    try {
      const { error } = await supabase.from("agendas").delete().eq("id", id)

      if (error) throw error
      toast.success("Agenda deleted successfully")
      fetchAgendas()
    } catch (error) {
      console.error("Error deleting agenda:", error)
      toast.error("Failed to delete agenda")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      problem_statement: "",
      category: "",
      priority_level: "Medium",
      status: "Draft",
      key_points: "",
      proposed_solutions: "",
      expected_outcomes: "",
      stakeholders: "",
      implementation_timeline: "",
      tags: "",
      references: "",
    })
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      "Under Review": "bg-blue-100 text-blue-800",
      Approved: "bg-green-100 text-green-800",
      Implemented: "bg-purple-100 text-purple-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agenda Management</h2>
          <p className="text-muted-foreground">Create and manage reform agendas</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingAgenda(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agenda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAgenda ? "Edit Agenda" : "Create New Agenda"}</DialogTitle>
              <DialogDescription>
                {editingAgenda ? "Update the agenda details" : "Fill in the details to create a new reform agenda"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Governance">Governance</SelectItem>
                      <SelectItem value="Democracy">Democracy</SelectItem>
                      <SelectItem value="Justice">Justice</SelectItem>
                      <SelectItem value="Federalism">Federalism</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority_level}
                    onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Implemented">Implemented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem_statement">Problem Statement *</Label>
                <Textarea
                  id="problem_statement"
                  value={formData.problem_statement}
                  onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key_points">Key Points (one per line)</Label>
                <Textarea
                  id="key_points"
                  value={formData.key_points}
                  onChange={(e) => setFormData({ ...formData, key_points: e.target.value })}
                  rows={4}
                  placeholder="Enter each key point on a new line"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposed_solutions">Proposed Solutions (one per line)</Label>
                <Textarea
                  id="proposed_solutions"
                  value={formData.proposed_solutions}
                  onChange={(e) => setFormData({ ...formData, proposed_solutions: e.target.value })}
                  rows={4}
                  placeholder="Enter each solution on a new line"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stakeholders">Stakeholders (comma-separated)</Label>
                  <Input
                    id="stakeholders"
                    value={formData.stakeholders}
                    onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                    placeholder="Government, Civil Society, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="reform, democracy, etc."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingAgenda ? "Update Agenda" : "Create Agenda"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agendas</CardTitle>
          <CardDescription>Manage existing reform agendas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading agendas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendas.map((agenda) => (
                  <TableRow key={agenda.id}>
                    <TableCell className="font-medium">{agenda.title}</TableCell>
                    <TableCell>{agenda.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(agenda.priority_level)}>
                        {agenda.priority_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(agenda.status)}>
                        {agenda.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(agenda.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(agenda)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(agenda.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
