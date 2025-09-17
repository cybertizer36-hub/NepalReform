'use client'

import { useState } from 'react'
import { useCacheInfo, useClearCache } from '@/hooks/use-cached-data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Database, Trash2, HardDrive, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

export function CacheStatus() {
  const { data: cacheInfo } = useCacheInfo()
  const { mutate: clearCache, isPending: isClearing } = useClearCache()
  const [showDialog, setShowDialog] = useState(false)

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const totalSize = (cacheInfo?.localStorageSize || 0) + (cacheInfo?.indexedDBSize || 0)
  const maxSize = 10 * 1024 * 1024 // 10MB max for demo
  const usagePercent = Math.min((totalSize / maxSize) * 100, 100)

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Cache Status</h3>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About Offline Cache</DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <p>
                  Your Nepal Reforms data is cached locally for faster loading and offline access.
                </p>
                <p>
                  This includes:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All 27 reform proposals</li>
                  <li>Your votes and preferences</li>
                  <li>Suggestions you've made</li>
                  <li>Filter settings</li>
                </ul>
                <p className="pt-2">
                  Data automatically syncs when you're online. Clear cache if you experience any issues.
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Cache Usage</span>
          <span>{formatBytes(totalSize)} / {formatBytes(maxSize)}</span>
        </div>
        <Progress value={usagePercent} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <HardDrive className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Local:</span>
          <span className="font-medium">{formatBytes(cacheInfo?.localStorageSize || 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">IndexedDB:</span>
          <span className="font-medium">{formatBytes(cacheInfo?.indexedDBSize || 0)}</span>
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {cacheInfo?.totalItems || 0} cached items
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={isClearing}
                className="h-7 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear Cache
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear Cache?</DialogTitle>
                <DialogDescription>
                  This will remove all cached data from your browser. The app will reload and fetch fresh data.
                  Your account data and votes stored on the server will not be affected.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    clearCache()
                    setShowDialog(false)
                  }}
                >
                  Clear Cache
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!navigator.onLine && (
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <div className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Offline Mode - Changes will sync when online</span>
          </div>
        </div>
      )}
    </Card>
  )
}
