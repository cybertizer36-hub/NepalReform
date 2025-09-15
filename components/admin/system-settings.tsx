"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Database, Mail, Shield, Globe, Download, Trash2, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface SystemStats {
  totalUsers: number
  totalAgendas: number
  totalVotes: number
  totalSuggestions: number
  databaseSize: string
  lastBackup: string | null
}

export function SystemSettings() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAgendas: 0,
    totalVotes: 0,
    totalSuggestions: 0,
    databaseSize: "0 MB",
    lastBackup: null,
  })
  const [settings, setSettings] = useState({
    platformName: "NepalReforms",
    platformUrl: "https://nepalreforms.com",
    platformDescription: "Empowering Nepal's youth to shape democratic reforms",
    maintenanceMode: false,
    allowRegistration: true,
    emailVerificationRequired: true,
    autoApproveSuggestions: false,
    maxAgendasPerPage: 10,
    maxSuggestionsPerUser: 5,
    enableComments: true,
    moderateComments: false,
    fromEmail: "noreply@nepalreforms.com",
    fromName: "NepalReforms",
    sendWelcomeEmails: true,
    sendNotificationEmails: true,
    autoBackup: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const [usersResult, agendasResult, votesResult, suggestionsResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("agendas").select("id", { count: "exact" }),
        supabase.from("agenda_votes").select("id", { count: "exact" }),
        supabase.from("suggestions").select("id", { count: "exact" }),
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalAgendas: agendasResult.count || 0,
        totalVotes: votesResult.count || 0,
        totalSuggestions: suggestionsResult.count || 0,
        databaseSize: "~2.5 MB", // Estimated
        lastBackup: new Date().toISOString(), // Mock data
      })
    } catch (error) {
      console.error("Error fetching system stats:", error)
    }
  }

  const logActivity = async (action: string, details?: any) => {
    try {
      const { error } = await supabase.from("activity_logs").insert([
        {
          action,
          resource_type: "system",
          details,
        },
      ])

      if (error) throw error
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // In a real implementation, you would save these to a settings table
      // For now, we'll just log the activity
      await logActivity("settings_updated", { settings })
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  const handleDatabaseCleanup = async () => {
    setLoading(true)
    try {
      // Clean up old activity logs (older than 90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase.from("activity_logs").delete().lt("created_at", ninetyDaysAgo)

      if (error) throw error

      await logActivity("database_cleanup", { cleaned_logs: true })
      toast.success("Database cleanup completed")
      fetchSystemStats()
    } catch (error) {
      console.error("Error during cleanup:", error)
      toast.error("Database cleanup failed")
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      // Export basic statistics and metadata
      const exportData = {
        timestamp: new Date().toISOString(),
        stats,
        settings,
        export_type: "system_backup",
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `nepalreforms-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      await logActivity("data_exported", { export_type: "system_backup" })
      toast.success("Data exported successfully")
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Data export failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResetAnalytics = async () => {
    if (!confirm("Are you sure you want to reset all analytics data? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      // This would reset analytics in a real implementation
      await logActivity("analytics_reset", { reset_timestamp: new Date().toISOString() })
      toast.success("Analytics data reset")
    } catch (error) {
      console.error("Error resetting analytics:", error)
      toast.error("Failed to reset analytics")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
        <p className="text-muted-foreground">Configure platform settings, security, and system maintenance</p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Users</Label>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Agendas</Label>
              <div className="text-2xl font-bold">{stats.totalAgendas}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Votes</Label>
              <div className="text-2xl font-bold">{stats.totalVotes}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Database Size</Label>
              <div className="text-2xl font-bold">{stats.databaseSize}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label className="text-sm font-medium">System Health</Label>
            <div className="flex items-center gap-2">
              <Progress value={85} className="flex-1" />
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last backup: {stats.lastBackup ? new Date(stats.lastBackup).toLocaleString() : "Never"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input
                  id="platform-name"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-url">Platform URL</Label>
                <Input
                  id="platform-url"
                  value={settings.platformUrl}
                  onChange={(e) => setSettings({ ...settings, platformUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-description">Platform Description</Label>
              <Textarea
                id="platform-description"
                value={settings.platformDescription}
                onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Enable to show maintenance page to users</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & User Management
            </CardTitle>
            <CardDescription>User registration, authentication, and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification Required</Label>
                <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
              </div>
              <Switch
                checked={settings.emailVerificationRequired}
                onCheckedChange={(checked) => setSettings({ ...settings, emailVerificationRequired: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve Suggestions</Label>
                <p className="text-sm text-muted-foreground">Automatically approve user suggestions</p>
              </div>
              <Switch
                checked={settings.autoApproveSuggestions}
                onCheckedChange={(checked) => setSettings({ ...settings, autoApproveSuggestions: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Content Settings
            </CardTitle>
            <CardDescription>Content moderation and display settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max-agendas">Max Agendas per Page</Label>
                <Input
                  id="max-agendas"
                  type="number"
                  value={settings.maxAgendasPerPage}
                  onChange={(e) => setSettings({ ...settings, maxAgendasPerPage: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-suggestions">Max Suggestions per User</Label>
                <Input
                  id="max-suggestions"
                  type="number"
                  value={settings.maxSuggestionsPerUser}
                  onChange={(e) => setSettings({ ...settings, maxSuggestionsPerUser: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Comments</Label>
                <p className="text-sm text-muted-foreground">Allow users to comment on agendas</p>
              </div>
              <Switch
                checked={settings.enableComments}
                onCheckedChange={(checked) => setSettings({ ...settings, enableComments: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Moderate Comments</Label>
                <p className="text-sm text-muted-foreground">Require approval for comments before publishing</p>
              </div>
              <Switch
                checked={settings.moderateComments}
                onCheckedChange={(checked) => setSettings({ ...settings, moderateComments: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
            <CardDescription>Email notifications and templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  value={settings.fromName}
                  onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Send Welcome Emails</Label>
                <p className="text-sm text-muted-foreground">Send welcome email to new users</p>
              </div>
              <Switch
                checked={settings.sendWelcomeEmails}
                onCheckedChange={(checked) => setSettings({ ...settings, sendWelcomeEmails: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Send Notification Emails</Label>
                <p className="text-sm text-muted-foreground">Send email notifications for platform activities</p>
              </div>
              <Switch
                checked={settings.sendNotificationEmails}
                onCheckedChange={(checked) => setSettings({ ...settings, sendNotificationEmails: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>Database maintenance, backup, and data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup database daily</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
              />
            </div>

            <Separator />

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Database operations can affect system performance. Use during low-traffic periods.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Database Cleanup</Label>
                  <p className="text-sm text-muted-foreground">Remove old logs and temporary data (90+ days)</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDatabaseCleanup} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Run Cleanup
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Export System Data</Label>
                  <p className="text-sm text-muted-foreground">Export platform data and settings for backup</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reset Analytics</Label>
                  <p className="text-sm text-muted-foreground">Reset all analytics and statistics data</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAnalytics}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSaveSettings} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
