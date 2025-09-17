'use client'

import { useEffect } from 'react'
import { useOfflineSync } from '@/hooks/use-cached-data'
import { toast } from 'sonner'

export function OfflineSync() {
  const { mutate: syncOffline } = useOfflineSync()

  useEffect(() => {
    // Check if we have offline actions on mount
    if (typeof window !== 'undefined') {
      const checkOfflineActions = () => {
        const offlineActions = localStorage.getItem('nepal_reforms_offline_actions')
        if (offlineActions && navigator.onLine) {
          try {
            const actions = JSON.parse(offlineActions)
            if (actions.data && actions.data.length > 0) {
              toast.info(`Syncing ${actions.data.length} offline actions...`)
              syncOffline()
            }
          } catch (error) {
            console.error('Error parsing offline actions:', error)
          }
        }
      }

      // Check on mount
      checkOfflineActions()

      // Listen for online/offline events
      const handleOnline = () => {
        toast.success('Back online! Syncing data...')
        checkOfflineActions()
      }

      const handleOffline = () => {
        toast.warning('You are offline. Changes will be saved locally.')
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [syncOffline])

  return null
}
