"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, BarChart3, Settings, LogOut, Activity, Quote, Shield } from "lucide-react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { manifestoData } from "@/lib/manifesto-data"

const AgendaManagement = dynamic(
  () => import("./agenda-management").then((mod) => ({ default: mod.AgendaManagement })),
  {
    loading: () => <div className="text-center py-8">Loading agenda management...</div>,
    ssr: false,
  },
)

const UserManagement = dynamic(() => import("./user-management").then((mod) => ({ default: mod.UserManagement })), {
  loading: () => <div className="text-center py-8">Loading user management...</div>,
  ssr: false,
})

const SuggestionManagement = dynamic(
  () => import("./suggestion-management").then((mod) => ({ default: mod.SuggestionManagement })),
  {
    loading: () => <div className="text-center py-8">Loading suggestion management...</div>,
    ssr: false,
  },
)

const TestimonialManagement = dynamic(
  () => import("./testimonial-management").then((mod) => ({ default: mod.TestimonialManagement })),
  {
    loading: () => <div className="text-center py-8">Loading testimonial management...</div>,
    ssr: false,
  },
)

const AnalyticsDashboard = dynamic(
  () => import("./analytics-dashboard").then((mod) => ({ default: mod.AnalyticsDashboard })),
  {
    loading: () => <div className="text-center py-8">Loading analytics...</div>,
    ssr: false,
  },
)

const SystemSettings = dynamic(() => import("./system-settings").then((mod) => ({ default: mod.SystemSettings })), {
  loading: () => <div className="text-center py-8">Loading settings...</div>,
  ssr: false,
})

const ActivityLogs = dynamic(() => import("./activity-logs").then((mod) => ({ default: mod.ActivityLogs })), {
  loading: () => <div className="text-center py-8">Loading activity logs...</div>,
  ssr: false,
})

interface AdminDashboardProps {
  user: User
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalSuggestions: number
  pendingSuggestions: number
  totalVotes: number
  totalOpinions: number
  recentActivity: number
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSuggestions: 0,
    pendingSuggestions: 0,
    totalVotes: 0,
    totalOpinions: 0,
    recentActivity: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch all statistics in parallel
      const [
        profilesResponse,
        suggestionsResponse,
        votesResponse,
        opinionsResponse,
        activityResponse
      ] = await Promise.all([
        supabase.from("profiles").select("id, is_active", { count: "exact" }),
        supabase.from("suggestions").select("id, status", { count: "exact" }),
        Promise.all([
          supabase.from("suggestion_votes").select("id", { count: "exact" }),
          supabase.from("agenda_votes").select("id", { count: "exact" })
        ]),
        supabase.from("opinions").select("id", { count: "exact" }),
        supabase.from("activity_logs")
          .select("id", { count: "exact" })
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      const profiles = profilesResponse.data || []
      const suggestions = suggestionsResponse.data || []
      const suggestionVotes = votesResponse[0].data || []
      const agendaVotes = votesResponse[1].data || []
      const opinions = opinionsResponse.data || []

      setStats({
        totalUsers: profilesResponse.count || 0,
        activeUsers: profiles.filter(p => p.is_active !== false).length,
        totalSuggestions: suggestionsResponse.count || 0,
        pendingSuggestions: suggestions.filter(s => s.status === "pending" || !s.status).length,
        totalVotes: (votesResponse[0].count || 0) + (votesResponse[1].count || 0),
        totalOpinions: opinionsResponse.count || 0,
        recentActivity: activityResponse.count || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Platform Overview</h3>
        <p className="text-muted-foreground">Real-time statistics and system health</p>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : `${stats.activeUsers} active users`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reform Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manifestoData.length}</div>
            <p className="text-xs text-muted-foreground">
              {manifestoData.filter(item => item.priority === "High").length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalSuggestions}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : `${stats.pendingSuggestions} pending review`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalVotes}</div>
            <p className="text-xs text-muted-foreground">Community engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opinions</CardTitle>
            <Quote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalOpinions}</div>
            <p className="text-xs text-muted-foreground">Community discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab("suggestions")}
            className="justify-start h-12"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Review {stats.pendingSuggestions} Pending Suggestions
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("users")}
            className="justify-start h-12"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Users & Permissions
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("analytics")}
            className="justify-start h-12"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("settings")}
            className="justify-start h-12"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure System Settings
          </Button>
        </CardContent>
      </Card>

      {/* Reform Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Reform Categories</CardTitle>
          <CardDescription>Overview of the 27 comprehensive reform proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {Array.from(new Set(manifestoData.map(item => item.category))).map(category => {
              const count = manifestoData.filter(item => item.category === category).length
              const priority = manifestoData.filter(item => item.category === category && item.priority === "High").length
              return (
                <div key={category} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{category}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} reforms, {priority} high priority
                    </p>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

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
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">NepalReforms Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                {user.email}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="agendas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reforms</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <Quote className="h-4 w-4" />
              <span className="hidden sm:inline">Testimonials</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="agendas">
            <AgendaManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="suggestions">
            <SuggestionManagement />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
