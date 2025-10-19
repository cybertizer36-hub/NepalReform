'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { CacheManager } from '@/lib/cache/cache-manager'
import { AuthProvider } from '@/contexts/auth-context'
import { I18nProvider } from '@/components/i18n-provider'
import dynamic from 'next/dynamic'

// Dynamically import FloatingChatWidget to avoid SSR issues
const FloatingChatWidget = dynamic(
  () => import('@/components/floating-chat-widget'),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 24 hours for static content
            staleTime: 24 * 60 * 60 * 1000,
            // Keep cache for 7 days
            gcTime: 7 * 24 * 60 * 60 * 1000,
            // Don't refetch on window focus for cached data
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect
            refetchOnReconnect: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      })
  )

  useEffect(() => {
    // Initialize cache manager on mount
    CacheManager.initialize()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          {children}
          <FloatingChatWidget />
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
