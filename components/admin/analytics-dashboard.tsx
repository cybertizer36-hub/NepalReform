"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Users, FileText, MessageSquare, Vote, TrendingUp, Calendar, Eye, Activity } from "lucide-react"
import { manifestoData } from "@/lib/manifesto-data"
import { Profile } from "./user-management"
import type { Suggestion } from "./suggestion-management"

interface AnalyticsData {
  users: {
    total: number
    active: number
    newThisMonth: number
    byRole: { role: string; count: number }[]
  }
  suggestions: {
    total: number
    pending: number
    approved: number
    rejected: number
    byStatus: { status: string; count: number }[]
    topAgendas: { agenda_id: string; count: number; title: string }[]
  }
  votes: {
    total: number
    byType: { type: string; count: number }[]
    topAgendas: { agenda_id: string; votes: number; title: string }[]
  }
  activity: {
    dailyActivity: { date: string; actions: number }[]
    topActions: { action: string; count: number }[]
  }
  opinions: {
    total: number
    byCategory: { category: string; count: number }[]
  }
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#d084d0", "#ffb347", "#67b7dc"]

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState("30days")
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      if (dateRange === "7days") {
        startDate.setDate(startDate.getDate() - 7)
      } else if (dateRange === "30days") {
        startDate.setDate(startDate.getDate() - 30)
      } else if (dateRange === "90days") {
        startDate.setDate(startDate.getDate() - 90)
      }

      // Fetch all data in parallel
      const [
        profilesData,
        suggestionsData,
        votesData,
        activityData,
        opinionsData
      ] = await Promise.all([
        // User analytics
        supabase.from("profiles").select("id, role, created_at, is_active"),
        
        // Suggestions analytics
        supabase.from("suggestions").select("id, status, agenda_id, created_at"),
        
        // Votes analytics - both suggestion votes and agenda votes
        Promise.all([
          supabase.from("suggestion_votes").select("id, vote_type, suggestion_id, created_at"),
          supabase.from("agenda_votes").select("id, vote_type, agenda_id, created_at")
        ]),
        
        // Activity logs
        supabase.from("activity_logs")
          .select("id, action, created_at")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        
        // Opinions analytics
        supabase.from("opinions").select("id, category, created_at")
      ])

      // Process user data
      const users = profilesData.data || []
      const activeUsers = users.filter((u: Profile) => u.is_active !== false)
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      const newUsersThisMonth = users.filter((u: Profile) => new Date(u.created_at) >= thisMonthStart)
      
      const roleGroups = users.reduce((acc: any, user: Profile) => {
        const role = user.role || "user"
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {})

      // Process suggestions data
      const suggestions = suggestionsData.data || []
      const statusGroups = suggestions.reduce((acc: any, s: Suggestion) => {
        acc[s.status] = (acc[s.status] || 0) + 1
        return acc
      }, {})

      // Count suggestions by agenda
      const suggestionsByAgenda = suggestions.reduce((acc: any, s: Suggestion) => {
        if (s.agenda_id) {
          acc[s.agenda_id] = (acc[s.agenda_id] || 0) + 1
        }
        return acc
      }, {})

      // Process votes data
      const suggestionVotes = votesData[0].data || []
      const agendaVotes = votesData[1].data || []
      const totalVotes = suggestionVotes.length + agendaVotes.length

      // Count votes by agenda
      type AgendaVote = {
        id: string;
        vote_type: string;
        agenda_id?: string;
        created_at?: string;
      };
      const votesByAgenda = agendaVotes.reduce((acc: any, v: AgendaVote) => {
        if (v.agenda_id) {
          acc[v.agenda_id] = (acc[v.agenda_id] || 0) + 1
        }
        return acc
      }, {})

      // Process activity data
      const activities = activityData.data || []
      type Activity = {
        id: string;
        action: string;
        created_at?: string;
      };
      const actionCounts = activities.reduce((acc: any, a: Activity) => {
        acc[a.action] = (acc[a.action] || 0) + 1
        return acc
      }, {})

      // Group activities by day
      const dailyActivities = activities.reduce((acc: Record<string, number>, a: Activity) => {
        const date = new Date(a.created_at ?? '').toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})

      // Process opinions data
      const opinions = opinionsData.data || []
      type Opinion = { category?: string };
      const categoryGroups = opinions.reduce((acc: Record<string, number>, o: Opinion) => {
        const category = o.category || "General"
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})

      // Prepare analytics data
      const analyticsData: AnalyticsData = {
        users: {
          total: users.length,
          active: activeUsers.length,
          newThisMonth: newUsersThisMonth.length,
          byRole: Object.entries(roleGroups).map(([role, count]) => ({ role, count: count as number }))
        },
        suggestions: {
          total: suggestions.length,
          pending: statusGroups.pending || 0,
          approved: statusGroups.approved || 0,
          rejected: statusGroups.rejected || 0,
          byStatus: Object.entries(statusGroups).map(([status, count]) => ({ status, count: count as number })),
          topAgendas: Object.entries(suggestionsByAgenda)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, count]) => {
              const agenda = manifestoData.find(a => a.id === id)
              return { agenda_id: id, count: count as number, title: agenda?.title || "Unknown" }
            })
        },
        votes: {
          total: totalVotes,
          byType: [
            { type: "Suggestion Votes", count: suggestionVotes.length },
            { type: "Agenda Votes", count: agendaVotes.length }
          ],
          topAgendas: Object.entries(votesByAgenda)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, votes]) => {
              const agenda = manifestoData.find(a => a.id === id)
              return { agenda_id: id, votes: votes as number, title: agenda?.title || "Unknown" }
            })
        },
        activity: {
          dailyActivity: Object.entries(dailyActivities)
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .slice(-30)
            .map(([date, actions]) => ({ date, actions: actions as number })),
          topActions: Object.entries(actionCounts)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 10)
            .map(([action, count]) => ({ action, count: count as number }))
        },
        opinions: {
          total: opinions.length,
          byCategory: Object.entries(categoryGroups).map(([category, count]) => ({ category, count: count as number }))
        }
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics data...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8">No analytics data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Platform insights and performance metrics</p>
        </div>
        
        <Tabs value={dateRange} onValueChange={setDateRange}>
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.users.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suggestions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.suggestions.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.suggestions.pending} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.votes.total}</div>
            <p className="text-xs text-muted-foreground">User engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opinions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.opinions.total}</div>
            <p className="text-xs text-muted-foreground">Community discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.active}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.users.active / analytics.users.total) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Platform activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.activity.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="actions" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Roles Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles Distribution</CardTitle>
            <CardDescription>Breakdown of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.users.byRole}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {analytics.users.byRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suggestion Status */}
        <Card>
          <CardHeader>
            <CardTitle>Suggestion Status</CardTitle>
            <CardDescription>Current status of all suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.suggestions.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Voted Agendas */}
        <Card>
          <CardHeader>
            <CardTitle>Top Voted Agendas</CardTitle>
            <CardDescription>Most engaged reform proposals</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.votes.topAgendas.length > 0 ? (
              <div className="space-y-4">
                {analytics.votes.topAgendas.map((agenda) => (
                  <div key={agenda.agenda_id} className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-medium line-clamp-1">{agenda.title}</p>
                      <p className="text-xs text-muted-foreground">ID: {agenda.agenda_id}</p>
                    </div>
                    <Badge variant="secondary">{agenda.votes} votes</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No voting data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Actions</CardTitle>
            <CardDescription>Most common platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.activity.topActions.length > 0 ? (
              <div className="space-y-3">
                {analytics.activity.topActions.slice(0, 5).map((action) => (
                  <div key={action.action} className="flex items-center justify-between">
                    <p className="text-sm">{action.action.replace(/_/g, " ")}</p>
                    <Badge variant="outline">{action.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity data available</p>
            )}
          </CardContent>
        </Card>

        {/* Opinion Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Opinion Categories</CardTitle>
            <CardDescription>Distribution of opinions by category</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.opinions.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.opinions.byCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {analytics.opinions.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center">No opinion data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Platform engagement statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggestion Approval Rate</p>
              <p className="text-2xl font-bold">
                {analytics.suggestions.total > 0
                  ? Math.round((analytics.suggestions.approved / analytics.suggestions.total) * 100)
                  : 0}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Active User Rate</p>
              <p className="text-2xl font-bold">
                {Math.round((analytics.users.active / analytics.users.total) * 100)}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Avg Votes per User</p>
              <p className="text-2xl font-bold">
                {analytics.users.total > 0
                  ? (analytics.votes.total / analytics.users.total).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Opinions per User</p>
              <p className="text-2xl font-bold">
                {analytics.users.total > 0
                  ? (analytics.opinions.total / analytics.users.total).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
