"use client"

import { useState, useEffect } from "react"
import { Testimonial } from "@/lib/types/testimonial"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    testimonial: "",
    image_url: "",
    linkedin_url: "",
    is_active: true,
    display_order: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials", {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial.id}`
        : "/api/testimonials"

      const response = await fetch(url, {
        method: editingTestimonial ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingTestimonial
            ? "Testimonial updated successfully"
            : "Testimonial added successfully",
        })
        fetchTestimonials()
        handleCloseDialog()
      } else {
        throw new Error("Failed to save testimonial")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save testimonial",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Testimonial deleted successfully",
        })
        fetchTestimonials()
      } else {
        throw new Error("Failed to delete testimonial")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      profession: testimonial.profession,
      testimonial: testimonial.testimonial,
      image_url: testimonial.image_url || "",
      linkedin_url: testimonial.linkedin_url || "",
      is_active: testimonial.is_active,
      display_order: testimonial.display_order,
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTestimonial(null)
    setFormData({
      name: "",
      profession: "",
      testimonial: "",
      image_url: "",
      linkedin_url: "",
      is_active: true,
      display_order: 0,
    })
  }

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...testimonial,
          is_active: !testimonial.is_active,
        }),
      })

      if (response.ok) {
        fetchTestimonials()
        toast({
          title: "Success",
          description: `Testimonial ${!testimonial.is_active ? "activated" : "deactivated"}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading testimonials...</div>
  }
  if (!Array.isArray(testimonials)) {
    return <div className="text-red-500">Testimonials data failed to load. Please try again later.</div>
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Testimonials</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead>Testimonial</TableHead>
                <TableHead>LinkedIn</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Order
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell className="font-medium">{testimonial.name}</TableCell>
                    <TableCell>{testimonial.profession}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {testimonial.testimonial}
                    </TableCell>
                    <TableCell>
                      {testimonial.linkedin_url ? (
                        <a
                          href={testimonial.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{testimonial.display_order}</TableCell>
                    <TableCell>
                      <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                        {testimonial.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(testimonial)}
                        >
                          {testimonial.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(testimonial)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(testimonial.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No testimonials yet. Add your first testimonial!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to {editingTestimonial ? "update" : "create"} a testimonial.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession *</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial">Testimonial *</Label>
              <Textarea
                id="testimonial"
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTestimonial ? "Update" : "Create"} Testimonial
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
