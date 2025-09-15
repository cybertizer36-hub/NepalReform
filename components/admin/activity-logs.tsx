"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Activity, Search, Eye, Calendar, User, Database, Settings, FileText } from "lucide-react"

interface ActivityLog {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  profiles: {
    email: string
    full_name: string | null
    role: string | null
  }
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [resourceFilter, setResourceFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [users, setUsers] = useState<Array<{ id: string; email: string; full_name: string | null }>>([])

  const supabase = createClient()

  useEffect(() => {
    fetchLogs()
    fetchUsers()
  }, [])

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          profiles (
            email,
            full_name,
            role
          )
        `)
        .order("created_at", { ascending: false })
        .limit(500)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error("Error fetching activity logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("id, email, full_name").order("email")

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter)
    const matchesResource = resourceFilter === "all" || log.resource_type === resourceFilter
    const matchesUser = userFilter === "all" || log.profiles?.email === userFilter

    return matchesSearch && matchesAction && matchesResource && matchesUser
  })

  const getActionIcon = (action: string) => {
    if (action.includes("user")) return <User className="h-4 w-4" />
    if (action.includes("agenda")) return <FileText className="h-4 w-4" />
    if (action.includes("suggestion")) return <FileText className="h-4 w-4" />
    if (action.includes("role")) return <Settings className="h-4 w-4" />
    if (action.includes("login") || action.includes("auth")) return <User className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("approve")) return "bg-green-100 text-green-800"
    if (action.includes("delete") || action.includes("reject")) return "bg-red-100 text-red-800"
    if (action.includes("update") || action.includes("edit")) return "bg-blue-100 text-blue-800"
    if (action.includes("login") || action.includes("auth")) return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case "user":
        return <User className="h-4 w-4" />
      case "agenda":
        return <FileText className="h-4 w-4" />
      case "suggestion":
        return <FileText className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  // Get unique actions and resource types for filters
  const uniqueActions = [...new Set(logs.map((log) => log.action.split("_")[0]))].sort()
  const uniqueResourceTypes = [...new Set(logs.map((log) => log.resource_type))].sort()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Activity Logs</h2>
        <p className="text-muted-foreground">Monitor system activities and user actions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {formatAction(action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            {uniqueResourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {formatAction(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.email}>
                {user.full_name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log) => new Date(log.created_at).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                new Set(
                  logs
                    .filter((log) => new Date(log.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000)
                    .map((log) => log.profiles?.email),
                ).size
              }
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log) => log.profiles?.role === "admin" || log.profiles?.role === "moderator").length}
            </div>
            <p className="text-xs text-muted-foreground">By admins/moderators</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Detailed log of all system activities and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading activity logs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge variant="outline" className={getActionColor(log.action)}>
                          {formatAction(log.action)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceIcon(log.resource_type)}
                        <span className="text-sm">{formatAction(log.resource_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {log.profiles?.full_name || log.profiles?.email || "System"}
                        </p>
                        {log.profiles?.full_name && (
                          <p className="text-xs text-muted-foreground">{log.profiles.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.profiles?.role && (
                        <Badge variant="outline" className="text-xs">
                          {log.profiles.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(log.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Activity Details</DialogTitle>
                            <DialogDescription>
                              {formatAction(selectedLog?.action || "")} on{" "}
                              {selectedLog?.created_at ? new Date(selectedLog.created_at).toLocaleString() : ""}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <h4 className="font-medium mb-2">Action Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Action:</strong> {formatAction(selectedLog.action)}
                                    </p>
                                    <p>
                                      <strong>Resource Type:</strong> {formatAction(selectedLog.resource_type)}
                                    </p>
                                    <p>
                                      <strong>Resource ID:</strong> {selectedLog.resource_id || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Timestamp:</strong> {new Date(selectedLog.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">User Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>User:</strong>{" "}
                                      {selectedLog.profiles?.full_name || selectedLog.profiles?.email || "System"}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {selectedLog.profiles?.email || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Role:</strong> {selectedLog.profiles?.role || "N/A"}
                                    </p>
                                    <p>
                                      <strong>IP Address:</strong> {selectedLog.ip_address || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {selectedLog.details && (
                                <div>
                                  <h4 className="font-medium mb-2">Additional Details</h4>
                                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {selectedLog.user_agent && (
                                <div>
                                  <h4 className="font-medium mb-2">User Agent</h4>
                                  <p className="text-xs text-muted-foreground break-all">{selectedLog.user_agent}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
