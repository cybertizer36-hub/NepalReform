'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook to require authentication for a component
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname
      const loginUrl = redirectTo + (currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '')
      router.push(loginUrl)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading, isAuthenticated: !!user }
}

/**
 * Hook to redirect authenticated users away from auth pages
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading, isAuthenticated: !!user }
}

/**
 * Hook to get authentication status without redirecting
 */
export function useAuthStatus() {
  const { user, loading } = useAuth()
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    userId: user?.id,
    userEmail: user?.email,
    userMetadata: user?.user_metadata,
  }
}

/**
 * Hook to check if user has specific role
 */
export function useUserRole() {
  const { user } = useAuth()
  
  // You can extend this to check roles from your database
  // For now, it returns basic user info
  const isAdmin = user?.user_metadata?.role === 'admin'
  const isModerator = user?.user_metadata?.role === 'moderator'
  
  return {
    user,
    isAdmin,
    isModerator,
    role: user?.user_metadata?.role || 'user',
  }
}
