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
import { useTranslation } from "react-i18next"

const CATEGORY_KEYS = [
  "governance",
  "democracy",
  "justice",
  "federalism",
  "administration",
  "economy",
  "education",
  "healthcare",
  "infrastructure",
]

const PRIORITY_KEYS = ["high", "medium", "low"]

export function OpinionForm() {
  const { t } = useTranslation('common')
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

      toast.success(t('opinions.successMessage'))
      router.push("/")
    } catch (error) {
      console.error("Error submitting opinion:", error)
      toast.error(t('opinions.errorMessage'))
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
        {t('opinions.addItem', { item: label.slice(0, -1) })}
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          {t('opinions.formTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                {t('opinions.agendaTitle')}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder={t('opinions.agendaTitlePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                {t('opinions.categoryRequired')}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('opinions.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_KEYS.map((key) => (
                    <SelectItem key={key} value={t(`opinions.categories.${key}`)}>
                      {t(`opinions.categories.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                {t('opinions.priorityLevel')}
              </Label>
              <Select
                value={formData.priority_level}
                onValueChange={(value) => handleInputChange("priority_level", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_KEYS.map((key) => (
                    <SelectItem key={key} value={t(`labels.priority.${key}`)}>
                      {t(`labels.priority.${key}`)} {t('opinions.prioritySuffix')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="space-y-2">
            <Label htmlFor="problem" className="text-sm font-medium">
              {t('opinions.problemStatementRequired')}
            </Label>
            <Textarea
              id="problem"
              value={formData.problem_statement}
              onChange={(e) => handleInputChange("problem_statement", e.target.value)}
              placeholder={t('opinions.problemStatementPlaceholder')}
              rows={4}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t('opinions.detailedDescription')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t('opinions.detailedDescriptionPlaceholder')}
              rows={6}
              required
            />
          </div>

          {/* Key Points */}
          <ArrayInput
            label={t('opinions.keyPoints')}
            array={keyPoints}
            setArray={setKeyPoints}
            placeholder={t('opinions.keyPointPlaceholder')}
          />

          {/* Proposed Solutions */}
          <ArrayInput
            label={t('opinions.proposedSolutions')}
            array={proposedSolutions}
            setArray={setProposedSolutions}
            placeholder={t('opinions.solutionDetailedPlaceholder')}
          />

          {/* Expected Outcomes */}
          <ArrayInput
            label={t('opinions.expectedOutcomes')}
            array={expectedOutcomes}
            setArray={setExpectedOutcomes}
            placeholder={t('opinions.outcomeDetailedPlaceholder')}
          />

          {/* Implementation Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium">
              {t('opinions.implementationTimeline')}
            </Label>
            <Textarea
              id="timeline"
              value={formData.implementation_timeline}
              onChange={(e) => handleInputChange("implementation_timeline", e.target.value)}
              placeholder={t('opinions.timelineDescription')}
              rows={3}
            />
          </div>

          {/* Stakeholders */}
          <ArrayInput
            label={t('opinions.keyStakeholders')}
            array={stakeholders}
            setArray={setStakeholders}
            placeholder={t('opinions.stakeholderDetailedPlaceholder')}
          />

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('opinions.tags')}</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={t('opinions.tagsPlaceholder')}
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
            label={t('opinions.references')}
            array={references}
            setArray={setReferences}
            placeholder={t('opinions.referenceDetailedPlaceholder')}
          />

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
              {t('opinions.cancel')}
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
                  {t('opinions.submitting')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('opinions.submit')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
