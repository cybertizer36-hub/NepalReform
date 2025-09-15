'use client'

import { useHydration } from '@/hooks/use-hydration'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isHydrated = useHydration()
  
  if (!isHydrated) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
