'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingChanges, setPendingChanges] = useState(0)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Get pending changes from localStorage
    const queue = localStorage.getItem('sync-queue')
    const changes = queue ? JSON.parse(queue).length : 0
    setPendingChanges(changes)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 gap-1 flex items-center w-fit">
      <AlertCircle className="w-3 h-3" />
      Syncing ({pendingChanges})
    </Badge>
  )
}
