'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { CacheManager } from '@/lib/cache/cache-manager'

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
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}
