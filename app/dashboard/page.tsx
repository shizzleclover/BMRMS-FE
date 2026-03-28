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
import { useAuth } from '@/components/AuthProvider'
import { User } from '@/lib/auth'
import { getPatients } from '@/lib/patients'
import { getConsents, getAccessLevelLabel } from '@/lib/consent'
import { getPatientRecords, MedicalRecordSummary } from '@/lib/records'
import { Users, FileText, CheckCircle, Clock, ArrowRight, ShieldCheck, Activity } from 'lucide-react'

// ----------------------------------------------------------------------------
// Patient Dashboard — focused on their own consents
// ----------------------------------------------------------------------------
function PatientDashboard({ user }: { user: User }) {
  const [activeConsents, setActiveConsents] = useState(0)
  const [recentConsents, setRecentConsents] = useState<any[]>([])
  const [recentRecords, setRecentRecords] = useState<MedicalRecordSummary[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const consents = await getConsents()
        setActiveConsents(consents.filter(c => c.status === 'active').length)

        const sorted = [...consents]
          .sort((a, b) => new Date(b.grantedDate).getTime() - new Date(a.grantedDate).getTime())
          .slice(0, 5)

        setRecentConsents(sorted)

        if (user.patientId) {
          const records = await getPatientRecords(user.patientId)
          setRecentRecords(records.slice(0, 5))
        }
      } catch (err) {
        console.error('Patient dashboard fetch error:', err)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Welcome, ${user.name}`}
          description="Your Healthcare Dashboard"
          icon="👋"
        />
        <SyncStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Active Consents"
          value={activeConsents}
          description="Doctors with access to your records"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <Card className="border-border bg-gradient-to-br from-green-50 to-emerald-50 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Consent Management
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Review and manage who can access your records</p>
          </div>
          <Link href="/consent" className="mt-4">
            <Button className="w-full md:w-auto gap-2">
              Manage Consents <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>

      {user.patientId && (
        <div className="mt-4">
          <Link href={`/patients/${user.patientId}`}>
            <Button variant="outline" className="w-full md:w-auto gap-2">
              <FileText className="w-4 h-4" />
              View My Profile
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>My Medical Records</CardTitle>
            <CardDescription>Latest records stored for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No records available yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="font-semibold text-foreground">Record</TableHead>
                    <TableHead className="font-semibold text-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-foreground">Doctor</TableHead>
                    <TableHead className="font-semibold text-foreground">Visit Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.map((r) => (
                    <TableRow key={r.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex flex-col">
                          <span>{r.recordNumber}</span>
                          <span className="text-xs text-muted-foreground truncate">{r.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.recordType}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.doctorName || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(r.visitDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Consent Activity</CardTitle>
            <CardDescription>Latest updates to your access permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="font-semibold text-foreground">Doctor</TableHead>
                  <TableHead className="font-semibold text-foreground">Access Level</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentConsents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No consent activity yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentConsents.map((c) => (
                    <TableRow key={c.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{c.grantedToName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{getAccessLevelLabel(c.accessLevel)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(c.grantedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={c.status === 'active' ? 'active' : c.status === 'expired' ? 'archived' : 'revoked'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ----------------------------------------------------------------------------
// Doctor Dashboard — focused on their patients and consents granted to them
// ----------------------------------------------------------------------------
function DoctorDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeConsents: 0,
    pendingRecords: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patients, consents] = await Promise.all([getPatients(), getConsents()])

        setStats({
          totalPatients: patients.length,
          activeConsents: consents.filter(c => c.status === 'active').length,
          pendingRecords: patients.filter(p => p.syncStatus !== 'synced').length,
        })

        const activity = [
          ...consents.slice(0, 3).map(c => ({
            type: 'consent' as const,
            title: `Consent from ${c.patientName}`,
            detail: getAccessLevelLabel(c.accessLevel),
            timestamp: c.grantedDate,
            status: c.status,
          })),
          ...patients.slice(0, 3).map(p => ({
            type: 'patient' as const,
            title: p.name,
            detail: `Blood: ${p.bloodType}`,
            timestamp: p.lastVisit || new Date().toISOString(),
            status: p.status || 'active',
          })),
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5)

        setRecentActivity(activity)
      } catch (err) {
        console.error('Doctor dashboard fetch error:', err)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Welcome, Dr. ${user.name}`}
          description={user.department ? `Department: ${user.department}` : 'Medical Dashboard'}
          icon="👋"
        />
        <SyncStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="My Patients"
          value={stats.totalPatients}
          description="Clinic roster plus patients who granted you consent"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Active Consents"
          value={stats.activeConsents}
          description="Patients granting you access"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Pending Sync"
          value={stats.pendingRecords}
          description="Records awaiting sync"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="border-border bg-gradient-to-br from-blue-50 to-sky-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Patient Records
            </CardTitle>
            <CardDescription>View and manage patient records</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/patients">
              <Button className="w-full gap-2">
                View Patients <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Patient Consents
            </CardTitle>
            <CardDescription>View consents granted to you</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/consent">
              <Button className="w-full gap-2">
                View Consents <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest patient and consent updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="font-semibold text-foreground">Activity</TableHead>
                  <TableHead className="font-semibold text-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Detail</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No recent activity
                    </TableCell>
                  </TableRow>
                ) : (
                  recentActivity.map((a, idx) => (
                    <TableRow key={idx} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{a.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">{a.type}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{a.detail}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(a.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={a.status === 'active' ? 'active' : a.status === 'pending' ? 'pending' : 'inactive'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ----------------------------------------------------------------------------
// Admin Dashboard — system-wide overview
// ----------------------------------------------------------------------------
function AdminDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeConsents: 0,
    revokedConsents: 0,
    totalConsents: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patients, consents] = await Promise.all([getPatients(), getConsents()])

        setStats({
          totalPatients: patients.length,
          activeConsents: consents.filter(c => c.status === 'active').length,
          revokedConsents: consents.filter(c => c.status === 'revoked').length,
          totalConsents: consents.length,
        })

        const activity = [
          ...consents.slice(0, 4).map(c => ({
            type: 'consent' as const,
            title: `${c.patientName} → ${c.grantedToName}`,
            detail: getAccessLevelLabel(c.accessLevel),
            timestamp: c.grantedDate,
            status: c.status,
          })),
          ...patients.slice(0, 3).map(p => ({
            type: 'patient' as const,
            title: p.name,
            detail: `ID: ${p.id.slice(-6)}`,
            timestamp: p.lastVisit || new Date().toISOString(),
            status: p.status || 'active',
          })),
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 6)

        setRecentActivity(activity)
      } catch (err) {
        console.error('Admin dashboard fetch error:', err)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Welcome, ${user.name}`}
          description="System Administration Dashboard"
          icon="👋"
        />
        <SyncStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          description="Registered patients"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Total Consents"
          value={stats.totalConsents}
          description="All consent records"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Active Consents"
          value={stats.activeConsents}
          description="Currently active"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          title="Revoked"
          value={stats.revokedConsents}
          description="Revoked consents"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="border-border bg-gradient-to-br from-blue-50 to-sky-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Patient Records
            </CardTitle>
            <CardDescription>Manage all patient records</CardDescription>
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
              Consent Records
            </CardTitle>
            <CardDescription>System-wide consent management</CardDescription>
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
              <Activity className="w-5 h-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription>Health &amp; Performance</CardDescription>
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

      <div className="mt-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest records and consent updates across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="font-semibold text-foreground">Activity</TableHead>
                  <TableHead className="font-semibold text-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-foreground">Detail</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No recent activity
                    </TableCell>
                  </TableRow>
                ) : (
                  recentActivity.map((a, idx) => (
                    <TableRow key={idx} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{a.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">{a.type}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{a.detail}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(a.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={a.status === 'active' ? 'active' : a.status === 'revoked' ? 'revoked' : 'inactive'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ----------------------------------------------------------------------------
// Main Dashboard Container — routes to the correct view per role
// ----------------------------------------------------------------------------
function DashboardContent() {
  const { user } = useAuth()

  if (!user) return null

  const Dashboard =
    user.role === 'patient'
      ? PatientDashboard
      : user.role === 'doctor'
        ? DoctorDashboard
        : AdminDashboard

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6">
          <Dashboard user={user as unknown as User} />

          <div className="mt-6">
            <Card className="border-border bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Offline Mode Support</CardTitle>
                <CardDescription>This application supports offline functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-foreground">
                <p>
                  Your interface and data are cached locally on this device. When offline, you can:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>View your dashboard and statistics</li>
                  <li>Access consent information</li>
                  <li>Make necessary changes (queued for sync)</li>
                </ul>
                <p className="pt-2">
                  All changes are automatically synced when you regain internet connection.
                </p>
              </CardContent>
            </Card>
          </div>
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
