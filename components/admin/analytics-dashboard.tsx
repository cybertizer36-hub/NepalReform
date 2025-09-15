"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, MessageSquare, ThumbsUp, ThumbsDown, Activity } from "lucide-react"
import dynamic from "next/dynamic"

// Import recharts with a different approach for v3 compatibility
const RechartsComponents = dynamic(
  () => import("recharts").then((mod) => ({
    default: () => null,
    LineChart: mod.LineChart,
    Line: mod.Line,
    BarChart: mod.BarChart,
    Bar: mod.Bar,
    PieChart: mod.PieChart,
    Pie: mod.Pie,
    Cell: mod.Cell,
    XAxis: mod.XAxis,
    YAxis: mod.YAxis,
    CartesianGrid: mod.CartesianGrid,
    Tooltip: mod.Tooltip,
    Legend: mod.Legend,
    ResponsiveContainer: mod.ResponsiveContainer,
  })),
  { ssr: false }
)

// Import all recharts components at once to avoid individual dynamic imports
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const ChartLoader = () => (
  <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading chart...</p>
    </div>
  </div>
)

interface AnalyticsData {
  totalUsers: number
  totalAgendas: number
  totalVotes: number
  totalSuggestions: number
  activeUsers: number
  newUsersThisMonth: number
  topAgendas: Array<{
    id: string
    title: string
    category: string
    likes: number
    dislikes: number
    engagement: number
  }>
  categoryStats: Array<{
    category: string
    count: number
    percentage: number
  }>
  userGrowth: Array<{
    month: string
    users: number
    agendas: number
  }>
  engagementTrends: Array<{
    date: string
    votes: number
    suggestions: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    user?: string
  }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalAgendas: 0,
    totalVotes: 0,
    totalSuggestions: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    topAgendas: [],
    categoryStats: [],
    userGrowth: [],
    engagementTrends: [],
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [chartsReady, setChartsReady] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      setChartsReady(true)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const [usersResult, agendasResult, votesResult, suggestionsResult] = await Promise.all([
        supabase.from("profiles").select("id, created_at", { count: "exact" }),
        supabase.from("agendas").select("id, created_at", { count: "exact" }),
        supabase.from("agenda_votes").select("id, created_at", { count: "exact" }),
        supabase.from("suggestions").select("id, created_at", { count: "exact" }),
      ])

      const { count: activeUsersCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("last_sign_in_at", sevenDaysAgo.toISOString())

      const { count: newUsersCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", thirtyDaysAgo.toISOString())

      const { data: agendas } = await supabase
        .from("agendas")
        .select(`
          id,
          title,
          category,
          agenda_votes (vote_type)
        `)
        .limit(10)

      const topAgendas =
        agendas
          ?.map((agenda) => {
            const likes = agenda.agenda_votes?.filter((vote: any) => vote.vote_type === "like").length || 0
            const dislikes = agenda.agenda_votes?.filter((vote: any) => vote.vote_type === "dislike").length || 0
            const engagement = likes + dislikes
            return {
              id: agenda.id,
              title: agenda.title,
              category: agenda.category,
              likes,
              dislikes,
              engagement,
            }
          })
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, 5) || []

      const { data: categoryData } = await supabase.from("agendas").select("category")
      const totalAgendasCount = categoryData?.length || 0

      const categoryStats =
        categoryData?.reduce(
          (acc, item) => {
            const existing = acc.find((stat) => stat.category === item.category)
            if (existing) {
              existing.count++
            } else {
              acc.push({ category: item.category, count: 1, percentage: 0 })
            }
            return acc
          },
          [] as Array<{ category: string; count: number; percentage: number }>,
        ) || []

      categoryStats.forEach((stat) => {
        stat.percentage = Math.round((stat.count / totalAgendasCount) * 100)
      })

      const userGrowthData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

        const { count: monthlyUsers } = await supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .gte("created_at", date.toISOString())
          .lt("created_at", nextMonth.toISOString())

        const { count: monthlyAgendas } = await supabase
          .from("agendas")
          .select("id", { count: "exact" })
          .gte("created_at", date.toISOString())
          .lt("created_at", nextMonth.toISOString())

        userGrowthData.push({
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          users: monthlyUsers || 0,
          agendas: monthlyAgendas || 0,
        })
      }

      const engagementData = []
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)

        const { count: dailyVotes } = await supabase
          .from("agenda_votes")
          .select("id", { count: "exact" })
          .gte("created_at", date.toISOString())
          .lt("created_at", nextDay.toISOString())

        const { count: dailySuggestions } = await supabase
          .from("suggestions")
          .select("id", { count: "exact" })
          .gte("created_at", date.toISOString())
          .lt("created_at", nextDay.toISOString())

        engagementData.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          votes: dailyVotes || 0,
          suggestions: dailySuggestions || 0,
        })
      }

      const { data: recentVotes } = await supabase
        .from("agenda_votes")
        .select(`
          created_at,
          vote_type,
          agendas(title),
          profiles(email, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      const { data: recentSuggestions } = await supabase
        .from("suggestions")
        .select(`
          created_at,
          content,
          profiles(email, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      const recentActivity = [
        ...(recentVotes?.map((vote: any) => ({
          type: "vote",
          description: `${vote.profiles?.full_name || vote.profiles?.email} ${vote.vote_type}d "${vote.agendas?.title}"`,
          timestamp: new Date(vote.created_at).toLocaleString(),
          user: vote.profiles?.email,
        })) || []),
        ...(recentSuggestions?.map((suggestion: any) => ({
          type: "suggestion",
          description: `${suggestion.profiles?.full_name || suggestion.profiles?.email} submitted a suggestion`,
          timestamp: new Date(suggestion.created_at).toLocaleString(),
          user: suggestion.profiles?.email,
        })) || []),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalAgendas: agendasResult.count || 0,
        totalVotes: votesResult.count || 0,
        totalSuggestions: suggestionsResult.count || 0,
        activeUsers: activeUsersCount || 0,
        newUsersThisMonth: newUsersCount || 0,
        topAgendas,
        categoryStats: categoryStats.sort((a, b) => b.count - a.count),
        userGrowth: userGrowthData,
        engagementTrends: engagementData,
        recentActivity,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#c6f6d5"]

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive platform insights and performance metrics</p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{analytics.newUsersThisMonth} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agendas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAgendas}</div>
            <p className="text-xs text-muted-foreground">Reform proposals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVotes}</div>
            <p className="text-xs text-muted-foreground">User engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSuggestions}</div>
            <p className="text-xs text-muted-foreground">User contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalUsers > 0 ? Math.round((analytics.totalVotes / analytics.totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Votes per user</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>User and agenda growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartsReady ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#059669" name="New Users" strokeWidth={2} />
                  <Line type="monotone" dataKey="agendas" stroke="#10b981" name="New Agendas" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartLoader />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Engagement</CardTitle>
            <CardDescription>Votes and suggestions over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {chartsReady ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.engagementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#059669" name="Votes" />
                  <Bar dataKey="suggestions" fill="#10b981" name="Suggestions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartLoader />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Agenda categories breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {chartsReady ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ category, percentage }: any) => `${category} (${percentage}%)`}
                  >
                    {analytics.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartLoader />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Engaged Agendas</CardTitle>
            <CardDescription>Highest engagement by votes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topAgendas.map((agenda, index) => (
              <div key={agenda.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-2">{agenda.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {agenda.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{agenda.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <ThumbsDown className="h-3 w-3" />
                    <span>{agenda.dislikes}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "vote"
                      ? "bg-green-500"
                      : activity.type === "suggestion"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
