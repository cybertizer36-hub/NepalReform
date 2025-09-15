"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Shield, Edit2, Save, X, MessageSquare, ThumbsUp } from "lucide-react"
import { toast } from "sonner"

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string | null
  created_at: string
  last_sign_in_at: string | null
}

interface UserProfileProps {
  user: any
  profile: Profile | null
}

export function UserProfile({ user, profile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    totalSuggestions: 0,
    totalVotes: 0,
    joinedDate: profile?.created_at || user.created_at,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      // Get user's suggestions count
      const { count: suggestionsCount } = await supabase
        .from("suggestions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      // Get user's votes count (both agenda and suggestion votes)
      const { count: agendaVotesCount } = await supabase
        .from("agenda_votes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: suggestionVotesCount } = await supabase
        .from("suggestion_votes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      setUserStats({
        totalSuggestions: suggestionsCount || 0,
        totalVotes: (agendaVotesCount || 0) + (suggestionVotesCount || 0),
        joinedDate: profile?.created_at || user.created_at,
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id)

      if (error) throw error

      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string | null | undefined) => {
    const colors = {
      admin: "bg-red-100 text-red-800 border-red-200",
      moderator: "bg-blue-100 text-blue-800 border-blue-200",
      user: "bg-green-100 text-green-800 border-green-200",
    }
    const roleKey = role || "user"
    return colors[roleKey as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and view your activity</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Information */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your personal details and account information</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {(fullName || user.email)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{fullName || "Anonymous User"}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className={getRoleBadgeColor(profile?.role)}>
                      {profile?.role || "user"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{fullName || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Role</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{profile?.role || "user"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(userStats.joinedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Stats */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Activity Overview</CardTitle>
                <CardDescription>Your participation statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Suggestions</p>
                      <p className="text-xs text-muted-foreground">Ideas shared</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{userStats.totalSuggestions}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <ThumbsUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Votes Cast</p>
                      <p className="text-xs text-muted-foreground">Total engagement</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{userStats.totalVotes}</span>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-purple-700">Engagement Score</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {userStats.totalSuggestions + userStats.totalVotes}
                    </p>
                    <p className="text-xs text-purple-600">Total contributions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <a href="/create-opinion">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Create New Opinion
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <a href="/">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Browse Agendas
                  </a>
                </Button>
                {(profile?.role === "admin" || profile?.role === "moderator") && (
                  <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                    <a href="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
