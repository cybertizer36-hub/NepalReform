'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  allowedRoles?: string[]
}

export function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  redirectTo = '/auth/login',
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      setIsChecking(false)
      
      if (requireAuth && !user) {
        // Save the current path to redirect back after login
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
        return
      }

      // Check role-based access if roles are specified
      if (user && allowedRoles.length > 0) {
        const userRole = user.user_metadata?.role || 'user'
        if (!allowedRoles.includes(userRole)) {
          // Redirect to unauthorized page or dashboard
          router.push('/dashboard')
          return
        }
      }
    }
  }, [user, loading, requireAuth, allowedRoles, router, redirectTo, pathname])

  // Show loading state
  if (loading || isChecking) {
    if (fallback) {
      return <div>{fallback}</div>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render children if auth is required but user is not authenticated
  if (requireAuth && !user) {
    return <div />
  }

  // Don't render children if role check fails
  if (user && allowedRoles.length > 0) {
    const userRole = user.user_metadata?.role || 'user'
    if (!allowedRoles.includes(userRole)) {
      return <div />
    }
  }

  return <div>{children}</div>
}

// Convenience components for common use cases
export function AdminRoute({ 
  children, 
  ...props 
}: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  )
}

export function ModeratorRoute({ 
  children, 
  ...props 
}: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute {...props} allowedRoles={['admin', 'moderator']}>
      {children}
    </ProtectedRoute>
  )
}

export function AuthenticatedRoute({ 
  children, 
  ...props 
}: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute {...props} requireAuth={true}>
      {children}
    </ProtectedRoute>
  )
}
