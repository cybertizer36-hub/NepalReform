/**
 * Comprehensive Cache Manager for Nepal Reforms Platform
 * Handles localStorage, IndexedDB, and memory caching
 */

export interface CacheConfig {
  version: string
  ttl: number // Time to live in milliseconds
  maxSize?: number // Max size in bytes for localStorage
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
  expires: number
}

export class CacheManager {
  private static instance: CacheManager
  private static VERSION = '1.0.0'
  private static dbName = 'NepalReformsDB'
  private static dbVersion = 1
  private db: IDBDatabase | null = null
  
  // Cache keys
  static readonly KEYS = {
    MANIFESTO_DATA: 'nepal_reforms_manifesto_v1',
    USER_VOTES: 'nepal_reforms_votes_v1',
    USER_SUGGESTIONS: 'nepal_reforms_suggestions_v1',
    USER_OPINIONS: 'nepal_reforms_opinions_v1',
    USER_PROFILE: 'nepal_reforms_profile_v1',
    FILTER_PREFERENCES: 'nepal_reforms_filters_v1',
    LAST_SYNC: 'nepal_reforms_last_sync_v1',
  }
  
  // Cache durations
  static readonly TTL = {
    MANIFESTO: 7 * 24 * 60 * 60 * 1000, // 7 days for static content
    VOTES: 30 * 60 * 1000, // 30 minutes for votes
    SUGGESTIONS: 60 * 60 * 1000, // 1 hour for suggestions
    OPINIONS: 60 * 60 * 1000, // 1 hour for opinions
    USER_DATA: 24 * 60 * 60 * 1000, // 24 hours for user data
  }

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  static async initialize(): Promise<void> {
    const instance = CacheManager.getInstance()
    await instance.initIndexedDB()
  }

  /**
   * Initialize IndexedDB for larger datasets
   */
  private async initIndexedDB(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CacheManager.dbName, CacheManager.dbVersion)
      
      request.onerror = () => {
        console.error('IndexedDB initialization failed')
        reject(request.error)
      }
      
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('manifesto')) {
          db.createObjectStore('manifesto', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('votes')) {
          db.createObjectStore('votes', { keyPath: 'manifesto_id' })
        }
        if (!db.objectStoreNames.contains('suggestions')) {
          db.createObjectStore('suggestions', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('opinions')) {
          db.createObjectStore('opinions', { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * Set data in localStorage with TTL and version
   */
  static setLocal<T>(key: string, data: T, ttl: number = this.TTL.USER_DATA): boolean {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: this.VERSION,
        expires: Date.now() + ttl,
      }
      
      const serialized = JSON.stringify(entry)
      
      // Check size limit (5MB for localStorage)
      if (serialized.length > 5 * 1024 * 1024) {
        console.warn(`Data too large for localStorage: ${key}`)
        return false
      }
      
      localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      console.error(`Failed to cache ${key}:`, error)
      // Clear old data if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearExpiredCache()
        // Try again
        try {
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            version: this.VERSION,
            expires: Date.now() + ttl,
          }
          localStorage.setItem(key, JSON.stringify(entry))
          return true
        } catch {
          return false
        }
      }
      return false
    }
  }

  /**
   * Get data from localStorage with version and TTL checks
   */
  static getLocal<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      
      const entry: CacheEntry<T> = JSON.parse(cached)
      
      // Check version
      if (entry.version !== this.VERSION) {
        localStorage.removeItem(key)
        return null
      }
      
      // Check expiration
      if (Date.now() > entry.expires) {
        localStorage.removeItem(key)
        return null
      }
      
      return entry.data
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error)
      localStorage.removeItem(key)
      return null
    }
  }

  /**
   * Store data in IndexedDB for larger datasets
   */
  async setIndexedDB<T>(storeName: string, data: T): Promise<boolean> {
    if (!this.db) return false
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)
      
      request.onsuccess = () => resolve(true)
      request.onerror = () => {
        console.error(`Failed to store in IndexedDB: ${storeName}`)
        resolve(false)
      }
    })
  }

  /**
   * Get data from IndexedDB
   */
  async getIndexedDB<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    if (!this.db) return null
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => {
        console.error(`Failed to retrieve from IndexedDB: ${storeName}`)
        resolve(null)
      }
    })
  }

  /**
   * Get all data from an IndexedDB store
   */
  async getAllIndexedDB<T>(storeName: string): Promise<T[]> {
    if (!this.db) return []
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => {
        console.error(`Failed to retrieve all from IndexedDB: ${storeName}`)
        resolve([])
      }
    })
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      
      try {
        const item = localStorage.getItem(key)
        if (!item) continue
        
        const entry = JSON.parse(item)
        if (entry.expires && Date.now() > entry.expires) {
          keysToRemove.push(key)
        }
      } catch {
        // If we can't parse it, it might be old format - remove it
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  /**
   * Clear all cache
   */
  static async clearAll(): Promise<void> {
    // Clear localStorage
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear IndexedDB
    const instance = CacheManager.getInstance()
    if (instance.db) {
      const stores = ['manifesto', 'votes', 'suggestions', 'opinions']
      for (const storeName of stores) {
        const transaction = instance.db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        store.clear()
      }
    }
  }

  /**
   * Get cache size info
   */
  static async getCacheInfo(): Promise<{
    localStorageSize: number
    indexedDBSize: number
    totalItems: number
  }> {
    let localStorageSize = 0
    let totalItems = 0
    
    // Calculate localStorage size
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageSize += localStorage[key].length + key.length
        totalItems++
      }
    }
    
    // Estimate IndexedDB size (if supported)
    let indexedDBSize = 0
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      indexedDBSize = estimate.usage || 0
    }
    
    return {
      localStorageSize,
      indexedDBSize,
      totalItems,
    }
  }

  /**
   * Save user interaction (vote/suggestion) for offline sync
   */
  static saveOfflineAction(action: {
    type: 'vote' | 'suggestion' | 'opinion'
    data: any
    timestamp: number
  }): void {
    const offlineKey = 'nepal_reforms_offline_actions'
    const existing = this.getLocal<any[]>(offlineKey) || []
    existing.push(action)
    this.setLocal(offlineKey, existing, this.TTL.USER_DATA)
  }

  /**
   * Get offline actions for sync
   */
  static getOfflineActions(): any[] {
    return this.getLocal<any[]>('nepal_reforms_offline_actions') || []
  }

  /**
   * Clear offline actions after sync
   */
  static clearOfflineActions(): void {
    localStorage.removeItem('nepal_reforms_offline_actions')
  }

  /**
   * Public method to check if IndexedDB is ready
   */
  public isIndexedDBReady(): boolean {
    return this.db !== null;
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  CacheManager.initialize().catch(console.error)
}
