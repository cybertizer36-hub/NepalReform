"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/logout-button"
import { UserIcon, FileText, MessageSquare, ThumbsUp, ThumbsDown, Plus, TrendingUp, Clock, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CacheStatus } from "@/components/cache-status"

interface UserDashboardProps {
  user: User
}

interface UserStats {
  votesCount: number
  suggestionsCount: number
  recentVotes: Array<{
    id: string
    agenda_title: string
    vote_type: string
    created_at: string
  }>
  recentSuggestions: Array<{
    id: string
    content: string
    agenda_title: string
    created_at: string
  }>
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<UserStats>({
    votesCount: 0,
    suggestionsCount: 0,
    recentVotes: [],
    recentSuggestions: [],
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      // Fetch user's vote count
      const { count: votesCount } = await supabase
        .from("agenda_votes")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)

      // Fetch user's suggestion count
      const { count: suggestionsCount } = await supabase
        .from("suggestions")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)

      // Fetch recent votes with agenda titles
      const { data: recentVotes } = await supabase
        .from("agenda_votes")
        .select(`
          id,
          vote_type,
          created_at,
          agendas (title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch recent suggestions with agenda titles
      const { data: recentSuggestions } = await supabase
        .from("suggestions")
        .select(`
          id,
          content,
          created_at,
          agendas (title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        votesCount: votesCount || 0,
        suggestionsCount: suggestionsCount || 0,
        recentVotes:
          recentVotes?.map((vote: any) => ({
            id: vote.id,
            agenda_title: Array.isArray(vote.agendas) 
              ? vote.agendas[0]?.title || "Unknown Agenda"
              : vote.agendas?.title || "Unknown Agenda",
            vote_type: vote.vote_type,
            created_at: vote.created_at,
          })) || [],
        recentSuggestions:
          recentSuggestions?.map((suggestion: any) => ({
            id: suggestion.id,
            content: suggestion.content,
            agenda_title: Array.isArray(suggestion.agendas)
              ? suggestion.agendas[0]?.title || "Unknown Agenda" 
              : suggestion.agendas?.title || "Unknown Agenda",
            created_at: suggestion.created_at,
          })) || [],
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const getDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">My Dashboard</h1>
                <p className="text-sm text-muted-foreground">Your NepalReforms Activity</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getUserInitials(user.email || "")}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground">Citizen</p>
              </div>
              <LogoutButton variant="outline" size="sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              My Activity
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back, {getDisplayName()}!</CardTitle>
                <CardDescription className="text-base">
                  Thank you for being part of Nepal's democratic reform movement. Your voice matters in shaping our
                  nation's future.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Votes</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.votesCount}</div>
                  <p className="text-xs text-muted-foreground">Total votes cast</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Suggestions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.suggestionsCount}</div>
                  <p className="text-xs text-muted-foreground">Ideas shared</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.votesCount + stats.suggestionsCount * 2}</div>
                  <p className="text-xs text-muted-foreground">Engagement points</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                  <p className="text-xs text-muted-foreground">Join date</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get involved in Nepal's reform discussions</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <Button className="justify-start h-auto p-4" onClick={() => router.push("/create-opinion")}>
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Create Opinion</div>
                      <div className="text-sm text-muted-foreground">Share your reform ideas</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4 bg-transparent"
                  onClick={() => router.push("/#agendas-section")}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Explore Agendas</div>
                      <div className="text-sm text-muted-foreground">View and vote on reform proposals</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4 bg-transparent"
                  onClick={() => router.push("/#agendas-section")}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Share Ideas</div>
                      <div className="text-sm text-muted-foreground">Contribute suggestions to agendas</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Votes */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Votes</CardTitle>
                  <CardDescription>Your latest voting activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.recentVotes.length > 0 ? (
                    stats.recentVotes.map((vote) => (
                      <div key={vote.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{vote.agenda_title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(vote.created_at)}</p>
                        </div>
                        <Badge variant={vote.vote_type === "like" ? "default" : "destructive"} className="ml-2">
                          {vote.vote_type === "like" ? (
                            <ThumbsUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ThumbsDown className="h-3 w-3 mr-1" />
                          )}
                          {vote.vote_type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No votes yet. Start by exploring agendas!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Suggestions</CardTitle>
                  <CardDescription>Your latest contributions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.recentSuggestions.length > 0 ? (
                    stats.recentSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{suggestion.agenda_title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(suggestion.created_at)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No suggestions yet. Share your ideas on reform agendas!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">{getUserInitials(user.email || "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{getDisplayName()}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Member since {formatDate(user.created_at)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <p className="text-sm text-muted-foreground">{getDisplayName()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <p className="text-sm text-muted-foreground">Citizen</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Contributions</label>
                    <p className="text-sm text-muted-foreground">{stats.votesCount + stats.suggestionsCount} actions</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Status</label>
                    <Badge variant="default" className="text-xs">
                      {user.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Sign In</label>
                    <p className="text-sm text-muted-foreground">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Email Verification</label>
                      <Badge variant={user.email_confirmed_at ? "default" : "secondary"} className="text-xs">
                        {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                    {!user.email_confirmed_at && (
                      <p className="text-xs text-muted-foreground">
                        Check your email for a verification link
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Two-Factor Authentication</label>
                      <Badge variant="outline" className="text-xs">Not Available</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Coming soon for enhanced security
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" className="w-full" size="sm">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Cache Status */}
              <CacheStatus />

              {/* App Information */}
              <Card>
                <CardHeader>
                  <CardTitle>App Information</CardTitle>
                  <CardDescription>Nepal Reforms Platform details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Version</label>
                      <p className="text-sm text-muted-foreground">1.0.0</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Updated</label>
                      <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">PWA Status</label>
                      <Badge variant="outline" className="text-xs mt-1">Ready to Install</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Service Worker</label>
                      <Badge variant="outline" className="text-xs mt-1">
                        {typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Data</CardTitle>
                  <CardDescription>Control your data and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Data Storage</label>
                      <span className="text-sm text-muted-foreground">Local + Cloud</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your data is stored locally for performance and backed up to the cloud
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Encryption</label>
                      <Badge variant="default" className="text-xs">Enabled</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All data transfers are encrypted using HTTPS
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => window.open('/privacy', '_blank')}>
                      View Privacy Policy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
