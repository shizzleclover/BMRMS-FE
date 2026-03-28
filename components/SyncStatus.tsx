'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { clearLocalSyncQueue } from '@/lib/consent'

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingChanges, setPendingChanges] = useState(0)

  const refreshCount = useCallback(() => {
    if (typeof window === 'undefined') return
    const queue = localStorage.getItem('sync-queue')
    setPendingChanges(queue ? JSON.parse(queue).length : 0)
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    refreshCount()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('sync-queue-changed', refreshCount)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('sync-queue-changed', refreshCount)
    }
  }, [refreshCount])

  if (isOnline && pendingChanges === 0) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-300 gap-1 flex items-center w-fit">
        <CheckCircle className="w-3 h-3" />
        Synced
      </Badge>
    )
  }

  if (!isOnline) {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-300 gap-1 flex items-center w-fit">
        <WifiOff className="w-3 h-3" />
        Offline Mode
      </Badge>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1 max-w-[min(100%,16rem)]">
      <Badge
        title="Old failed requests stuck in this browser only — they never reached the server. Clear after fixing API URL or login."
        className="bg-yellow-100 text-yellow-800 border-yellow-300 gap-1 flex items-center w-fit text-left whitespace-normal h-auto py-1"
      >
        <AlertCircle className="w-3 h-3 shrink-0" />
        <span className="text-[10px] leading-tight">Queued locally ({pendingChanges})</span>
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-[10px] text-muted-foreground"
        onClick={() => {
          clearLocalSyncQueue()
          setPendingChanges(0)
        }}
      >
        Clear local queue
      </Button>
    </div>
  )
}
