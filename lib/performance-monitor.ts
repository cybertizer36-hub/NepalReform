/**
 * Performance monitoring utilities for Nepal Reforms Platform
 * Tracks cache performance, load times, and storage usage
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, any> = new Map()

  private constructor() {
    this.initialize()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Monitor page load performance
    this.monitorPageLoad()
    
    // Monitor storage usage
    this.monitorStorage()
    
    // Monitor network status
    this.monitorNetwork()
    
    // Monitor cache hits/misses
    this.monitorCachePerformance()
  }

  /**
   * Monitor page load performance
   */
  private monitorPageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (perfData) {
          const loadTime = perfData.loadEventEnd - perfData.fetchStart
          const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart
          const timeToFirstByte = perfData.responseStart - perfData.fetchStart
          
          this.metrics.set('pageLoadTime', loadTime)
          this.metrics.set('domContentLoaded', domContentLoaded)
          this.metrics.set('timeToFirstByte', timeToFirstByte)
          
          console.log(`📊 Performance Metrics:
            - Page Load: ${loadTime.toFixed(2)}ms
            - DOM Ready: ${domContentLoaded.toFixed(2)}ms
            - TTFB: ${timeToFirstByte.toFixed(2)}ms
          `)
          
          // Send to analytics if needed
          this.reportMetrics({
            type: 'page_load',
            loadTime,
            domContentLoaded,
            timeToFirstByte,
          })
        }
      })
    }
  }

  /**
   * Monitor storage usage
   */
  private async monitorStorage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const percentUsed = (usage / quota) * 100
        
        this.metrics.set('storageUsage', usage)
        this.metrics.set('storageQuota', quota)
        this.metrics.set('storagePercent', percentUsed)
        
        console.log(`💾 Storage Usage: ${this.formatBytes(usage)} / ${this.formatBytes(quota)} (${percentUsed.toFixed(2)}%)`)
        
        // Alert if storage is getting full
        if (percentUsed > 80) {
          console.warn('⚠️ Storage usage is above 80%')
        }
      } catch (error) {
        console.error('Error estimating storage:', error)
      }
    }
  }

  /**
   * Monitor network status
   */
  private monitorNetwork() {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection) {
        const updateNetworkInfo = () => {
          this.metrics.set('networkType', connection.effectiveType)
          this.metrics.set('networkSpeed', connection.downlink)
          this.metrics.set('networkRtt', connection.rtt)
          
          console.log(`🌐 Network: ${connection.effectiveType} (${connection.downlink}Mbps, RTT: ${connection.rtt}ms)`)
        }
        
        updateNetworkInfo()
        connection.addEventListener('change', updateNetworkInfo)
      }
    }
    
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.metrics.set('isOnline', true)
      console.log('✅ Back online')
    })
    
    window.addEventListener('offline', () => {
      this.metrics.set('isOnline', false)
      console.log('⚠️ Gone offline')
    })
  }

  /**
   * Monitor cache performance
   */
  private monitorCachePerformance() {
    // Track cache hits and misses
    const originalFetch = window.fetch
    let cacheHits = 0
    let cacheMisses = 0
    
    window.fetch = async (...args) => {
      const startTime = performance.now()
      
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // Check if response was from cache
        const fromCache = duration < 50 // Assume cache if very fast
        
        if (fromCache) {
          cacheHits++
        } else {
          cacheMisses++
        }
        
        const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100
        this.metrics.set('cacheHitRate', hitRate)
        this.metrics.set('cacheHits', cacheHits)
        this.metrics.set('cacheMisses', cacheMisses)
        
        // Log slow requests
        if (duration > 1000) {
          console.warn(`⚠️ Slow request (${duration.toFixed(0)}ms):`, args[0])
        }
        
        return response
      } catch (error) {
        cacheMisses++
        throw error
      }
    }
  }

  /**
   * Track custom metrics
   */
  trackMetric(name: string, value: any) {
    this.metrics.set(name, value)
    console.log(`📊 ${name}: ${value}`)
  }

  /**
   * Track timing
   */
  startTiming(label: string) {
    performance.mark(`${label}-start`)
  }

  endTiming(label: string) {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const measure = performance.getEntriesByName(label)[0]
    if (measure) {
      this.metrics.set(`timing_${label}`, measure.duration)
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`)
      return measure.duration
    }
    return 0
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  /**
   * Report metrics to analytics
   */
  private reportMetrics(data: any) {
    // Send to your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', data)
    }
    
    // Or send to your custom analytics endpoint
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) })
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Log performance summary
   */
  logSummary() {
    console.group('📊 Performance Summary')
    
    const metrics = this.getMetrics()
    
    if (metrics.pageLoadTime) {
      console.log(`Page Load: ${metrics.pageLoadTime.toFixed(0)}ms`)
    }
    
    if (metrics.cacheHitRate !== undefined) {
      console.log(`Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}% (${metrics.cacheHits} hits, ${metrics.cacheMisses} misses)`)
    }
    
    if (metrics.storagePercent !== undefined) {
      console.log(`Storage Used: ${metrics.storagePercent.toFixed(1)}%`)
    }
    
    if (metrics.networkType) {
      console.log(`Network: ${metrics.networkType}`)
    }
    
    console.groupEnd()
  }
}

// Auto-initialize and expose globally for debugging
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance()
  
  // Expose for debugging
  ;(window as any).performanceMonitor = monitor
  
  // Log summary after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitor.logSummary()
    }, 2000)
  })
}

// Export singleton instance
export const performanceMonitor = typeof window !== 'undefined' 
  ? PerformanceMonitor.getInstance()
  : null
