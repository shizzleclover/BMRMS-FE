'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { SyncStatus } from '@/components/SyncStatus'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCurrentUser } from '@/lib/auth'
import { getPatients } from '@/lib/patients'
import { getConsents } from '@/lib/consent'
import { Users, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'doctor' | 'patient' | 'admin'
  department?: string
  avatar?: string
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeConsents: 0,
    pendingConsents: 0,
    recordsSynced: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    // Get current user
    const currentUser = getCurrentUser()
    setUser(currentUser)

    // Calculate stats
    const patients = getPatients()
    const consents = getConsents()

    const activeConsents = consents.filter(c => c.status === 'active').length
    const pendingConsents = consents.filter(c => c.status === 'pending').length
    const syncedRecords = patients.filter(p => p.syncStatus === 'synced').length

    setStats({
      totalPatients: patients.length,
      activeConsents,
      pendingConsents,
      recordsSynced: syncedRecords,
    })

    // Get recent activity
    const activity = [
      ...patients.slice(0, 3).map(p => ({
        type: 'patient',
        title: `Patient record: ${p.name}`,
        timestamp: p.lastVisit,
        status: p.status,
      })),
      ...consents.slice(0, 3).map(c => ({
        type: 'consent',
        title: `Consent: ${c.patientName}`,
        timestamp: c.grantedDate,
        status: c.status,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setRecentActivity(activity.slice(0, 5))
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6 space-y-6">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <PageHeader
              title={`Welcome, ${user?.name || 'User'}`}
              description={`${user?.role === 'doctor' ? 'Department: ' + (user?.department || 'N/A') : 'Healthcare Records Dashboard'}`}
              icon="👋"
            />
            <SyncStatus />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              description="Active patient records"
              icon={<Users className="w-5 h-5" />}
              trend={{ direction: 'up', value: 8 }}
            />
            <StatCard
              title="Active Consents"
              value={stats.activeConsents}
              description="Granted permissions"
              icon={<CheckCircle className="w-5 h-5" />}
              trend={{ direction: 'up', value: 12 }}
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingConsents}
              description="Awaiting review"
              icon={<Clock className="w-5 h-5" />}
            />
            <StatCard
              title="Records Synced"
              value={`${stats.recordsSynced}/${stats.totalPatients}`}
              description="Data synchronization"
              icon={<FileText className="w-5 h-5" />}
              trend={{ direction: 'up', value: 100 }}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border bg-gradient-to-br from-blue-50 to-sky-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Patient Records
                </CardTitle>
                <CardDescription>Manage medical records</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/patients">
                  <Button className="w-full gap-2">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Consent Management
                </CardTitle>
                <CardDescription>Review permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/consent">
                  <Button className="w-full gap-2">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  System Status
                </CardTitle>
                <CardDescription>Health & Performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>API Status:</span>
                    <StatusBadge status="active" label="Online" />
                  </div>
                  <div className="flex justify-between">
                    <span>Sync:</span>
                    <SyncStatus />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest records and consent updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="font-semibold text-foreground">Activity</TableHead>
                    <TableHead className="font-semibold text-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-foreground">Date</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No recent activity
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentActivity.map((activity, idx) => (
                      <TableRow key={idx} className="border-b border-border hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">{activity.title}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {activity.type === 'patient' ? 'Patient' : 'Consent'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge 
                            status={activity.status === 'active' ? 'active' : activity.status === 'pending' ? 'pending' : 'inactive'} 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Offline Information */}
          <Card className="border-border bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Offline Mode Support</CardTitle>
              <CardDescription>This application supports offline functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <p>
                Your healthcare records and patient data are cached locally on this device. 
                When offline, you can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>View patient records and medical history</li>
                <li>Access consent information</li>
                <li>Make changes to records (queued for sync)</li>
                <li>View your dashboard and statistics</li>
              </ul>
              <p className="pt-2">
                All changes are automatically synced when you regain internet connection.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
