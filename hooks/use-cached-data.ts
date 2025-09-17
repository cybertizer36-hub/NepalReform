/**
 * Custom React Query hooks for Nepal Reforms Platform
 * Implements comprehensive caching strategy
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { manifestoData } from '@/lib/manifesto-data'
import { CacheManager } from '@/lib/cache/cache-manager'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { ManifestoItem } from '@/lib/manifesto-data'

const supabase = createClientComponentClient()

/**
 * Hook for fetching manifesto data with multi-layer caching
 */
export function useManifestoData() {
  return useQuery({
    queryKey: ['manifesto', 'all'],
    queryFn: async (): Promise<ManifestoItem[]> => {
      // 1. Try to get from localStorage first (fastest)
      const cachedData = CacheManager.getLocal<ManifestoItem[]>(
        CacheManager.KEYS.MANIFESTO_DATA
      )
      if (cachedData) {
        console.log('📦 Loading manifesto from localStorage cache')
        return cachedData
      }

      // 2. Try IndexedDB for larger dataset
      const cacheInstance = CacheManager.getInstance();
      if (cacheInstance.isIndexedDBReady()) {
        const indexedData = await cacheInstance.getAllIndexedDB<ManifestoItem>('manifesto')
        if (indexedData && indexedData.length > 0) {
          console.log('💾 Loading manifesto from IndexedDB')
          // Also save to localStorage for next time
          CacheManager.setLocal(CacheManager.KEYS.MANIFESTO_DATA, indexedData, CacheManager.TTL.MANIFESTO)
          return indexedData
        }
      }

      // 3. Load from static data (no server call needed!)
      console.log('📄 Loading manifesto from static data')
      const data = manifestoData

      // 4. Cache for future use
      CacheManager.setLocal(CacheManager.KEYS.MANIFESTO_DATA, data, CacheManager.TTL.MANIFESTO)
      
      // Also save to IndexedDB for persistence
      if (cacheInstance.isIndexedDBReady()) {
        for (const item of data) {
          await cacheInstance.setIndexedDB('manifesto', item)
        }
      }

      return data
    },
    staleTime: CacheManager.TTL.MANIFESTO, // Data is fresh for 7 days
    // cacheTime: Infinity, // Removed: not a valid option
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}

/**
 * Hook for fetching votes with caching
 */
export function useVotes(manifestoId?: string) {
  const queryKey = manifestoId ? ['votes', manifestoId] : ['votes', 'all']
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // 1. Check localStorage cache first
      const cacheKey = manifestoId 
        ? `${CacheManager.KEYS.USER_VOTES}_${manifestoId}`
        : CacheManager.KEYS.USER_VOTES
      
      const cachedVotes = CacheManager.getLocal<any[]>(cacheKey)
      if (cachedVotes) {
        console.log('📦 Loading votes from cache')
        return cachedVotes
      }

      // 2. Fetch from Supabase
      console.log('🔄 Fetching votes from server')
      let query = supabase.from('votes').select('*')
      
      if (manifestoId) {
        query = query.eq('manifesto_id', manifestoId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching votes:', error)
        // Return cached data even if expired as fallback
        const expiredCache = localStorage.getItem(cacheKey)
        if (expiredCache) {
          try {
            const parsed = JSON.parse(expiredCache)
            return parsed.data || []
          } catch {
            return []
          }
        }
        throw error
      }

      // 3. Cache the result
      if (data) {
        CacheManager.setLocal(cacheKey, data, CacheManager.TTL.VOTES)
      }

      return data || []
    },
    staleTime: CacheManager.TTL.VOTES,
    // cacheTime: CacheManager.TTL.VOTES * 2, // Removed: not a valid option
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

/**
 * Hook for submitting votes with optimistic updates
 */
export function useVoteMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      manifestoId, 
      userId, 
      voteType 
    }: { 
      manifestoId: string
      userId?: string
      voteType: 'up' | 'down' 
    }) => {
      // Save to offline actions if no connection
      if (!navigator.onLine) {
        CacheManager.saveOfflineAction({
          type: 'vote',
          data: { manifestoId, userId, voteType },
          timestamp: Date.now(),
        })
        return { offline: true, manifestoId, voteType }
      }

      const { data, error } = await supabase
        .from('votes')
        .upsert({
          manifesto_id: manifestoId,
          user_id: userId,
          vote_type: voteType,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onMutate: async ({ manifestoId, voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['votes'] })
      
      // Snapshot previous value
      const previousVotes = queryClient.getQueryData(['votes', 'all'])
      
      // Optimistically update cache
      queryClient.setQueryData(['votes', 'all'], (old: any[]) => {
        const newVote = {
          manifesto_id: manifestoId,
          vote_type: voteType,
          created_at: new Date().toISOString(),
          id: `temp_${Date.now()}`,
        }
        return [...(old || []), newVote]
      })
      
      // Update localStorage cache immediately
      const cacheKey = CacheManager.KEYS.USER_VOTES
      const currentVotes = CacheManager.getLocal<any[]>(cacheKey) || []
      currentVotes.push({
        manifesto_id: manifestoId,
        vote_type: voteType,
        created_at: new Date().toISOString(),
      })
      CacheManager.setLocal(cacheKey, currentVotes, CacheManager.TTL.VOTES)
      
      return { previousVotes }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousVotes) {
        queryClient.setQueryData(['votes', 'all'], context.previousVotes)
      }
      console.error('Vote error:', err)
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch specific vote queries
      queryClient.invalidateQueries({ queryKey: ['votes', variables.manifestoId] })
      
      // Update cache with real data
      const cacheKey = `${CacheManager.KEYS.USER_VOTES}_${variables.manifestoId}`
      queryClient.setQueryData(['votes', variables.manifestoId], (old: any[]) => {
        return [...(old || []).filter((v: any) => !v.id.startsWith('temp_')), data]
      })
    },
  })
}

/**
 * Hook for fetching suggestions with caching
 */
export function useSuggestions(manifestoId?: string) {
  return useQuery({
    queryKey: manifestoId ? ['suggestions', manifestoId] : ['suggestions', 'all'],
    queryFn: async () => {
      const cacheKey = manifestoId
        ? `${CacheManager.KEYS.USER_SUGGESTIONS}_${manifestoId}`
        : CacheManager.KEYS.USER_SUGGESTIONS
      
      // Check cache first
      const cached = CacheManager.getLocal<any[]>(cacheKey)
      if (cached) {
        console.log('📦 Loading suggestions from cache')
        return cached
      }

      // Fetch from server
      console.log('🔄 Fetching suggestions from server')
      let query = supabase
        .from('suggestions')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
      
      if (manifestoId) {
        query = query.eq('manifesto_id', manifestoId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching suggestions:', error)
        // Return empty array as fallback
        return []
      }

      // Cache the result
      if (data) {
        CacheManager.setLocal(cacheKey, data, CacheManager.TTL.SUGGESTIONS)
      }

      return data || []
    },
    staleTime: CacheManager.TTL.SUGGESTIONS,
    // cacheTime: CacheManager.TTL.SUGGESTIONS * 2, // Removed: not a valid option
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for submitting suggestions
 */
export function useSuggestionMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (suggestion: {
      manifesto_id: string
      title: string
      description: string
      user_id?: string
    }) => {
      // Handle offline
      if (!navigator.onLine) {
        CacheManager.saveOfflineAction({
          type: 'suggestion',
          data: suggestion,
          timestamp: Date.now(),
        })
        return { offline: true, ...suggestion }
      }

      const { data, error } = await supabase
        .from('suggestions')
        .insert(suggestion)
        .select('*, profiles(*)')
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      // Update cache
      const cacheKey = `${CacheManager.KEYS.USER_SUGGESTIONS}_${variables.manifesto_id}`
      queryClient.setQueryData(['suggestions', variables.manifesto_id], (old: any[]) => {
        return [data, ...(old || [])]
      })
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })
}

/**
 * Hook for fetching user profile with caching
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      // Check cache first
      const cached = CacheManager.getLocal<any>(CacheManager.KEYS.USER_PROFILE)
      if (cached) {
        console.log('📦 Loading user profile from cache')
        return cached
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Fetch profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      // Cache the result
      if (data) {
        CacheManager.setLocal(CacheManager.KEYS.USER_PROFILE, data, CacheManager.TTL.USER_DATA)
      }

      return data
    },
    staleTime: CacheManager.TTL.USER_DATA,
    // cacheTime: CacheManager.TTL.USER_DATA * 2, // Removed: not a valid option
  })
}

/**
 * Hook for syncing offline actions
 */
export function useOfflineSync() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const offlineActions = CacheManager.getOfflineActions()
      if (offlineActions.length === 0) return []

      console.log(`🔄 Syncing ${offlineActions.length} offline actions`)
      
      const results = []
      for (const action of offlineActions) {
        try {
          if (action.type === 'vote') {
            const { data } = await supabase
              .from('votes')
              .upsert(action.data)
              .select()
            results.push({ success: true, data })
          } else if (action.type === 'suggestion') {
            const { data } = await supabase
              .from('suggestions')
              .insert(action.data)
              .select()
            results.push({ success: true, data })
          }
        } catch (error) {
          console.error(`Failed to sync ${action.type}:`, error)
          results.push({ success: false, error })
        }
      }
      
      return results
    },
    onSuccess: () => {
      // Clear offline actions
      CacheManager.clearOfflineActions()
      
      // Invalidate all queries to refresh with server data
      queryClient.invalidateQueries({ queryKey: ['votes'] })
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
      
      console.log('✅ Offline sync completed')
    },
  })
}

/**
 * Hook to get cache info
 */
export function useCacheInfo() {
  return useQuery({
    queryKey: ['cache', 'info'],
    queryFn: () => CacheManager.getCacheInfo(),
    staleTime: 5000, // Refresh every 5 seconds
  })
}

/**
 * Hook to clear all cache
 */
export function useClearCache() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await CacheManager.clearAll()
      queryClient.clear()
      return true
    },
    onSuccess: () => {
      console.log('🗑️ All cache cleared')
      window.location.reload()
    },
  })
}
