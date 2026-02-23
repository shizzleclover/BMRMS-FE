'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { SyncStatus } from '@/components/SyncStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { getCurrentUser } from '@/lib/auth'
import { RefreshCw, Trash2, Download } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
}

interface SyncQueueItem {
  type: string
  timestamp: string
  data?: any
}

function SettingsContent() {
  const [user, setUser] = useState<User | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([])
  const [offlineMode, setOfflineMode] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [cacheSize, setCacheSize] = useState(0)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    // Check online status
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load sync queue
    const queue = localStorage.getItem('sync-queue')
    if (queue) {
      try {
        setSyncQueue(JSON.parse(queue))
      } catch {
        setSyncQueue([])
      }
    }

    // Calculate cache size
    let size = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length
      }
    }
    setCacheSize(size)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSyncNow = async () => {
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 1500))
    localStorage.removeItem('sync-queue')
    setSyncQueue([])
  }

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data? This cannot be undone.')) {
      localStorage.clear()
      setCacheSize(0)
      window.location.reload()
    }
  }

  const handleExportData = () => {
    const data = {
      user: localStorage.getItem('auth-user'),
      patients: localStorage.getItem('patients'),
      consents: localStorage.getItem('consents'),
      exportDate: new Date().toISOString(),
    }

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)))
    element.setAttribute('download', `bmrms-backup-${Date.now()}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6 space-y-6">
          <PageHeader
            title="Settings"
            description="Configure your BMRMS preferences and system settings"
            icon="⚙️"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Settings */}
            <div className="md:col-span-2 space-y-6">
              {/* Account Settings */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && (
                    <>
                      <div>
                        <Label className="text-muted-foreground text-xs">Name</Label>
                        <p className="text-foreground font-medium mt-1">{user.name}</p>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground text-xs">Email</Label>
                        <p className="text-foreground font-medium mt-1">{user.email}</p>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground text-xs">Role</Label>
                        <p className="text-foreground font-medium mt-1 capitalize">{user.role}</p>
                      </div>
                      {user.department && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-muted-foreground text-xs">Department</Label>
                            <p className="text-foreground font-medium mt-1">{user.department}</p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Offline Settings */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Offline Mode Settings</CardTitle>
                  <CardDescription>Configure offline functionality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="offline-mode" className="text-foreground">
                        Enable Offline Mode
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Allow access to cached data when offline
                      </p>
                    </div>
                    <Switch
                      id="offline-mode"
                      checked={offlineMode}
                      onCheckedChange={setOfflineMode}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-sync" className="text-foreground">
                        Auto Sync
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Automatically sync when connection is restored
                      </p>
                    </div>
                    <Switch
                      id="auto-sync"
                      checked={autoSync}
                      onCheckedChange={setAutoSync}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-foreground">Sync Queue Status</Label>
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      {syncQueue.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No pending changes</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {syncQueue.length} pending {syncQueue.length === 1 ? 'change' : 'changes'}
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {syncQueue.slice(0, 3).map((item, idx) => (
                              <li key={idx}>• {item.type}</li>
                            ))}
                            {syncQueue.length > 3 && (
                              <li>• +{syncQueue.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {syncQueue.length > 0 && (
                    <Button
                      onClick={handleSyncNow}
                      className="w-full gap-2"
                      disabled={!isOnline}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Sync Now
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="border-border border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900">Data Management</CardTitle>
                  <CardDescription>Manage your cached data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Cache Size</Label>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-foreground font-medium">{formatBytes(cacheSize)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Object.keys(localStorage).length} items
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </Button>
                    <Button
                      onClick={handleClearCache}
                      variant="destructive"
                      className="w-full gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </Button>
                  </div>

                  <Alert variant="destructive">
                    <AlertDescription>
                      Clearing data will remove all cached records from this device. This cannot be undone.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* System Status */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Connection</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium text-foreground">
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Sync Status</p>
                    <SyncStatus />
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">About BMRMS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="text-foreground font-medium">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Platform</p>
                    <p className="text-foreground font-medium">Web Application</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Features</p>
                    <ul className="text-foreground space-y-1 mt-1">
                      <li>✓ Offline Support</li>
                      <li>✓ Data Encryption</li>
                      <li>✓ Sync Queue</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
