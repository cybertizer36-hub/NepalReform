"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, UserCheck, UserX, Shield, Ban, Eye, Activity, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string | null
  created_at: string
  last_sign_in_at: string | null
  is_active?: boolean
}

interface ActivityLog {
  id: string
  action: string
  resource_type: string
  details: any
  created_at: string
  user_agent: string | null
  ip_address: string | null
}

export function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [userActivity, setUserActivity] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const supabase = createClient()

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try fetching from API first
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache"
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to fetch profiles")
      }

      setProfiles(responseData.data || [])
      setDebugInfo(responseData.debug || null)
      
      // If API returns empty data, show helpful message
      if (!responseData.data || responseData.data.length === 0) {
        setError("No users found. This could mean the database is empty or there's a connection issue.")
      }
    } catch (apiError: any) {
      console.error("API Error:", apiError)
      
      // If API fails, try direct Supabase query as fallback
      try {
        console.log("Falling back to direct Supabase query...")
        const { data: directData, error: directError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          
        if (directError) {
          console.error("Direct query error:", directError)
          throw directError
        }
        
        setProfiles(directData || [])
        toast.warning("Using direct database connection (API fallback)")
      } catch (fallbackError: any) {
        console.error("Fallback error:", fallbackError)
        setError(`Failed to fetch users: ${apiError.message}. Fallback also failed: ${fallbackError.message}`)
        toast.error("Failed to load users. Please check your database connection.")
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const fetchUserActivity = async (userId: string) => {
    setActivityLoading(true)
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Activity logs error:", error)
        if (error.message.includes("does not exist")) {
          toast.warning("Activity logs table not found. Run the database migration script.")
        } else {
          throw error
        }
      }
      
      setUserActivity(data || [])
    } catch (error: any) {
      console.error("Error fetching user activity:", error)
      toast.error("Failed to fetch user activity")
    } finally {
      setActivityLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Try API update first
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        // Fallback to direct update
        const { error } = await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", userId)
          
        if (error) throw error
      }

      setProfiles(profiles.map((profile) => 
        profile.id === userId ? { ...profile, role: newRole } : profile
      ))

      toast.success(`User role updated to ${newRole}`)
    } catch (error: any) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role: " + error.message)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Direct Supabase update
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId)
        
      if (error) throw error

      setProfiles(profiles.map((profile) => 
        profile.id === userId ? { ...profile, is_active: isActive } : profile
      ))

      toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`)
    } catch (error: any) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status: " + error.message)
    }
  }

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || profile.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (role: string | null) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      moderator: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadgeColor = (isActive: boolean | undefined) => {
    return isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Debug Info Alert */}
      {debugInfo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            Service Role Configured: {debugInfo.serviceRoleConfigured ? "✓" : "✗"} | 
            Profiles Count: {debugInfo.profilesCount}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchProfiles} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.filter((p) => p.is_active !== false).length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.filter((p) => p.role === "admin").length}</div>
            <p className="text-xs text-muted-foreground">Administrative users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deactivated</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.filter((p) => p.is_active === false).length}</div>
            <p className="text-xs text-muted-foreground">Inactive users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts, roles, and security settings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2">Loading users...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {profiles.length === 0 ? "No users found in the database" : "No users match your filters"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.email}</TableCell>
                    <TableCell>{profile.full_name || "Not provided"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(profile.role)}>
                        {profile.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(profile.is_active)}>
                        {profile.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={profile.role || "user"}
                          onValueChange={(value) => updateUserRole(profile.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(profile.id, profile.is_active === false)}
                          title={profile.is_active !== false ? "Deactivate user" : "Activate user"}
                        >
                          {profile.is_active !== false ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(profile)
                                fetchUserActivity(profile.id)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Details: {selectedUser?.email}</DialogTitle>
                              <DialogDescription>View user information and recent activity</DialogDescription>
                            </DialogHeader>

                            {selectedUser && (
                              <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <h4 className="font-medium mb-2">User Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <strong>ID:</strong> {selectedUser.id}
                                      </p>
                                      <p>
                                        <strong>Email:</strong> {selectedUser.email}
                                      </p>
                                      <p>
                                        <strong>Full Name:</strong> {selectedUser.full_name || "Not provided"}
                                      </p>
                                      <p>
                                        <strong>Role:</strong> {selectedUser.role || "user"}
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        {selectedUser.is_active !== false ? "Active" : "Inactive"}
                                      </p>
                                      <p>
                                        <strong>Joined:</strong>{" "}
                                        {new Date(selectedUser.created_at).toLocaleDateString()}
                                      </p>
                                      <p>
                                        <strong>Last Sign In:</strong>{" "}
                                        {selectedUser.last_sign_in_at
                                          ? new Date(selectedUser.last_sign_in_at).toLocaleDateString()
                                          : "Never"}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Quick Actions</h4>
                                    <div className="space-y-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start bg-transparent"
                                        onClick={() =>
                                          toggleUserStatus(selectedUser.id, selectedUser.is_active === false)
                                        }
                                      >
                                        {selectedUser.is_active !== false ? (
                                          <Ban className="h-4 w-4 mr-2" />
                                        ) : (
                                          <UserCheck className="h-4 w-4 mr-2" />
                                        )}
                                        {selectedUser.is_active !== false ? "Deactivate User" : "Activate User"}
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Recent Activity
                                  </h4>
                                  {activityLoading ? (
                                    <div className="text-center py-4">Loading activity...</div>
                                  ) : userActivity.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                      {userActivity.map((log) => (
                                        <div key={log.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                                          <div className="w-2 h-2 bg-primary rounded-full" />
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">{log.action.replace(/_/g, " ")}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(log.created_at).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No recent activity found</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
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
