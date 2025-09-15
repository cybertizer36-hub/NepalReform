"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, X, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const CATEGORIES = [
  "Governance",
  "Democracy",
  "Justice",
  "Federalism",
  "Administration",
  "Economy",
  "Education",
  "Healthcare",
  "Infrastructure",
]

const PRIORITY_LEVELS = ["High", "Medium", "Low"]

export function OpinionForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problem_statement: "",
    category: "",
    priority_level: "Medium",
    implementation_timeline: "",
  })

  const [keyPoints, setKeyPoints] = useState<string[]>([""])
  const [proposedSolutions, setProposedSolutions] = useState<string[]>([""])
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>([""])
  const [stakeholders, setStakeholders] = useState<string[]>([""])
  const [tags, setTags] = useState<string[]>([])
  const [references, setReferences] = useState<string[]>([""])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (array: string[], setArray: (arr: string[]) => void, index: number, value: string) => {
    const newArray = [...array]
    newArray[index] = value
    setArray(newArray)
  }

  const addArrayItem = (array: string[], setArray: (arr: string[]) => void) => {
    setArray([...array, ""])
  }

  const removeArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Filter out empty values from arrays
      const cleanedData = {
        ...formData,
        key_points: keyPoints.filter((point) => point.trim()),
        proposed_solutions: proposedSolutions.filter((solution) => solution.trim()),
        expected_outcomes: expectedOutcomes.filter((outcome) => outcome.trim()),
        stakeholders: stakeholders.filter((stakeholder) => stakeholder.trim()),
        references: references.filter((ref) => ref.trim()),
        tags,
        status: "Draft", // New opinions start as drafts
        user_id: user.id,
      }

      const { error } = await supabase.from("agendas").insert(cleanedData)

      if (error) throw error

      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "opinion",
            data: cleanedData,
          }),
        })
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError)
        // Don't fail the request if email fails
      }

      toast.success("Opinion submitted successfully! It will be reviewed before publication.")
      router.push("/")
    } catch (error) {
      console.error("Error submitting opinion:", error)
      toast.error("Failed to submit opinion. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const ArrayInput = ({
    label,
    array,
    setArray,
    placeholder,
  }: {
    label: string
    array: string[]
    setArray: (arr: string[]) => void
    placeholder: string
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      {array.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            value={item}
            onChange={(e) => handleArrayChange(array, setArray, index, e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1"
          />
          {array.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem(array, setArray, index)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem(array, setArray)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {label.slice(0, -1)}
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Share Your Agenda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Agenda Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter a clear, descriptive title for your opinion"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority Level
              </Label>
              <Select
                value={formData.priority_level}
                onValueChange={(value) => handleInputChange("priority_level", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority} Priority
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="space-y-2">
            <Label htmlFor="problem" className="text-sm font-medium">
              Problem Statement *
            </Label>
            <Textarea
              id="problem"
              value={formData.problem_statement}
              onChange={(e) => handleInputChange("problem_statement", e.target.value)}
              placeholder="Describe the problem or issue you want to address"
              rows={4}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide a comprehensive description of your opinion and reasoning"
              rows={6}
              required
            />
          </div>

          {/* Key Points */}
          <ArrayInput
            label="Key Points"
            array={keyPoints}
            setArray={setKeyPoints}
            placeholder="Enter a key point or argument"
          />

          {/* Proposed Solutions */}
          <ArrayInput
            label="Proposed Solutions"
            array={proposedSolutions}
            setArray={setProposedSolutions}
            placeholder="Describe a potential solution or approach"
          />

          {/* Expected Outcomes */}
          <ArrayInput
            label="Expected Outcomes"
            array={expectedOutcomes}
            setArray={setExpectedOutcomes}
            placeholder="What positive outcomes do you expect?"
          />

          {/* Implementation Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium">
              Implementation Timeline
            </Label>
            <Textarea
              id="timeline"
              value={formData.implementation_timeline}
              onChange={(e) => handleInputChange("implementation_timeline", e.target.value)}
              placeholder="Describe the proposed timeline for implementation"
              rows={3}
            />
          </div>

          {/* Stakeholders */}
          <ArrayInput
            label="Key Stakeholders"
            array={stakeholders}
            setArray={setStakeholders}
            placeholder="Who are the key stakeholders involved?"
          />

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* References */}
          <ArrayInput
            label="References"
            array={references}
            setArray={setReferences}
            placeholder="Add a reference URL or citation"
          />

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.title ||
                !formData.category ||
                !formData.problem_statement ||
                !formData.description
              }
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Opinion
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
