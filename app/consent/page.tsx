'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { SyncStatus } from '@/components/SyncStatus'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/components/AuthProvider'
import {
  getConsents,
  revokeConsent,
  createConsent,
  getDoctorOptions,
  Consent,
  getAccessLevelLabel,
  getScopeLabel,
} from '@/lib/consent'
import { Plus, Eye, Trash2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Shared consent detail dialog
// ---------------------------------------------------------------------------
function ConsentDetailDialog({
  consent,
  open,
  onOpenChange,
}: {
  consent: Consent
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Consent Details</DialogTitle>
          <DialogDescription>Full information about this consent record</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Patient</p>
              <p className="text-sm text-foreground">{consent.patientName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Granted To</p>
              <p className="text-sm text-foreground">{consent.grantedToName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Access Level</p>
              <p className="text-sm text-foreground">{getAccessLevelLabel(consent.accessLevel)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Scope</p>
              <p className="text-sm text-foreground">{getScopeLabel(consent.scope)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
              <StatusBadge status={consent.status === 'active' ? 'active' : consent.status === 'expired' ? 'archived' : 'revoked'} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Granted Date</p>
              <p className="text-sm text-foreground">{new Date(consent.grantedDate).toLocaleDateString()}</p>
            </div>
          </div>
          {consent.expiryDate && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Expires</p>
              <p className="text-sm text-foreground">{new Date(consent.expiryDate).toLocaleDateString()}</p>
            </div>
          )}
          {consent.revokedDate && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Revoked</p>
              <p className="text-sm text-foreground">{new Date(consent.revokedDate).toLocaleDateString()}</p>
            </div>
          )}
          {consent.clinicName && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Clinic</p>
              <p className="text-sm text-foreground">{consent.clinicName}</p>
            </div>
          )}
          {consent.blockchainTxHash && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Blockchain Tx</p>
              <p className="text-xs text-muted-foreground font-mono break-all">{consent.blockchainTxHash}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Patient View — manage consents they&apos;ve granted
// ---------------------------------------------------------------------------
function PatientConsentView() {
  const [consents, setConsents] = useState<Consent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<Consent | null>(null)
  const [showGrant, setShowGrant] = useState(false)
  const [doctorId, setDoctorId] = useState('')
  const [doctorOptions, setDoctorOptions] = useState<{ id: string; name: string; email: string }[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [accessLevel, setAccessLevel] = useState('read')
  const [isGranting, setIsGranting] = useState(false)

  const refresh = async () => {
    setIsLoading(true)
    setConsents(await getConsents())
    setIsLoading(false)
  }

  useEffect(() => { refresh() }, [])

  useEffect(() => {
    if (!showGrant) return
    let cancelled = false
    ;(async () => {
      setDoctorsLoading(true)
      const opts = await getDoctorOptions()
      if (!cancelled) {
        setDoctorOptions(opts)
        setDoctorsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [showGrant])

  const handleGrant = async () => {
    if (!doctorId.trim()) return
    setIsGranting(true)
    const result = await createConsent(doctorId.trim(), accessLevel)
    if (result) {
      await refresh()
      setShowGrant(false)
      setDoctorId('')
      setAccessLevel('read')
    }
    setIsGranting(false)
  }

  const handleRevoke = async (consent: Consent) => {
    const updated = await revokeConsent(consent.id, 'Revoked by patient')
    if (updated) {
      setConsents(prev => prev.map(c => (c.id === consent.id ? updated : c)))
    }
    setRevokeTarget(null)
  }

  const statusMap = (s: string) =>
    s === 'active' ? 'active' as const : s === 'expired' ? 'archived' as const : 'revoked' as const

  return (
    <>
      <PageHeader
        title="My Consents"
        description="Manage who can access your medical records"
        icon="🔐"
        action={
          <Dialog
            open={showGrant}
            onOpenChange={(open) => {
              setShowGrant(open)
              if (!open) {
                setDoctorId('')
                setAccessLevel('read')
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Grant Access
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Grant New Consent</DialogTitle>
                <DialogDescription>
                  Allow a doctor to access your medical records.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="doctorSelect">Doctor</Label>
                  {doctorsLoading ? (
                    <p className="mt-2 text-sm text-muted-foreground">Loading doctors...</p>
                  ) : doctorOptions.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No doctors are registered yet. Ask your clinic admin to add doctor accounts first.
                    </p>
                  ) : (
                    <Select value={doctorId || undefined} onValueChange={setDoctorId}>
                      <SelectTrigger id="doctorSelect" className="mt-1">
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorOptions.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                            {d.email ? ` — ${d.email}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read &amp; Write</SelectItem>
                      <SelectItem value="full">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="ghost" onClick={() => setShowGrant(false)}>Cancel</Button>
                  <Button
                    onClick={handleGrant}
                    disabled={
                      isGranting ||
                      !doctorId.trim() ||
                      doctorsLoading ||
                      doctorOptions.length === 0
                    }
                  >
                    {isGranting ? 'Granting...' : 'Grant Consent'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex justify-end"><SyncStatus /></div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading consents...</div>
      ) : consents.length === 0 ? (
        <Card className="border-border p-8 text-center text-muted-foreground">
          You haven&apos;t granted any consents yet. Use the &quot;Grant Access&quot; button to allow a doctor to view your records.
        </Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="font-semibold text-foreground">Doctor</TableHead>
                <TableHead className="font-semibold text-foreground">Access Level</TableHead>
                <TableHead className="font-semibold text-foreground">Scope</TableHead>
                <TableHead className="font-semibold text-foreground">Granted</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consents.map((c) => (
                <TableRow key={c.id} className="border-b border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{c.grantedToName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getAccessLevelLabel(c.accessLevel)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getScopeLabel(c.scope)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(c.grantedDate).toLocaleDateString()}</TableCell>
                  <TableCell><StatusBadge status={statusMap(c.status)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedConsent(c)}>
                        <Eye className="w-4 h-4" /> Details
                      </Button>
                      {c.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => setRevokeTarget(c)}
                        >
                          <Trash2 className="w-4 h-4" /> Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedConsent && (
        <ConsentDetailDialog consent={selectedConsent} open={!!selectedConsent} onOpenChange={(o) => !o && setSelectedConsent(null)} />
      )}

      <Dialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Consent</DialogTitle>
            <DialogDescription>Are you sure you want to revoke access for {revokeTarget?.grantedToName}?</DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              Once revoked, {revokeTarget?.grantedToName} will no longer be able to access your medical records.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeTarget && handleRevoke(revokeTarget)}>
              Revoke Consent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// Doctor View — see consents granted TO them (read-only)
// ---------------------------------------------------------------------------
function DoctorConsentView() {
  const [consents, setConsents] = useState<Consent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setConsents(await getConsents())
      setIsLoading(false)
    }
    load()
  }, [])

  const statusMap = (s: string) =>
    s === 'active' ? 'active' as const : s === 'expired' ? 'archived' as const : 'revoked' as const

  return (
    <>
      <PageHeader
        title="Patient Consents"
        description="Patients who have granted you access to their records"
        icon="📋"
      />

      <div className="flex justify-end"><SyncStatus /></div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading consents...</div>
      ) : consents.length === 0 ? (
        <Card className="border-border p-8 text-center text-muted-foreground">
          No patients have granted you consent yet.
        </Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="font-semibold text-foreground">Patient</TableHead>
                <TableHead className="font-semibold text-foreground">Access Level</TableHead>
                <TableHead className="font-semibold text-foreground">Scope</TableHead>
                <TableHead className="font-semibold text-foreground">Granted</TableHead>
                <TableHead className="font-semibold text-foreground">Expires</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consents.map((c) => (
                <TableRow key={c.id} className="border-b border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{c.patientName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getAccessLevelLabel(c.accessLevel)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getScopeLabel(c.scope)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(c.grantedDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell><StatusBadge status={statusMap(c.status)} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedConsent(c)}>
                      <Eye className="w-4 h-4" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedConsent && (
        <ConsentDetailDialog consent={selectedConsent} open={!!selectedConsent} onOpenChange={(o) => !o && setSelectedConsent(null)} />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Admin View — see all consents system-wide, can revoke
// ---------------------------------------------------------------------------
function AdminConsentView() {
  const [consents, setConsents] = useState<Consent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<Consent | null>(null)

  const refresh = async () => {
    setIsLoading(true)
    setConsents(await getConsents())
    setIsLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const handleRevoke = async (consent: Consent) => {
    const updated = await revokeConsent(consent.id, 'Revoked by admin')
    if (updated) {
      setConsents(prev => prev.map(c => (c.id === consent.id ? updated : c)))
    }
    setRevokeTarget(null)
  }

  const statusMap = (s: string) =>
    s === 'active' ? 'active' as const : s === 'expired' ? 'archived' as const : 'revoked' as const

  return (
    <>
      <PageHeader
        title="All Consent Records"
        description="System-wide consent management"
        icon="🛡️"
      />

      <div className="flex justify-end"><SyncStatus /></div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading consents...</div>
      ) : consents.length === 0 ? (
        <Card className="border-border p-8 text-center text-muted-foreground">
          No consent records in the system yet.
        </Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="font-semibold text-foreground">Patient</TableHead>
                <TableHead className="font-semibold text-foreground">Granted To</TableHead>
                <TableHead className="font-semibold text-foreground">Access</TableHead>
                <TableHead className="font-semibold text-foreground">Scope</TableHead>
                <TableHead className="font-semibold text-foreground">Date</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consents.map((c) => (
                <TableRow key={c.id} className="border-b border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{c.patientName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.grantedToName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getAccessLevelLabel(c.accessLevel)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getScopeLabel(c.scope)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(c.grantedDate).toLocaleDateString()}</TableCell>
                  <TableCell><StatusBadge status={statusMap(c.status)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedConsent(c)}>
                        <Eye className="w-4 h-4" /> Details
                      </Button>
                      {c.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => setRevokeTarget(c)}
                        >
                          <Trash2 className="w-4 h-4" /> Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedConsent && (
        <ConsentDetailDialog consent={selectedConsent} open={!!selectedConsent} onOpenChange={(o) => !o && setSelectedConsent(null)} />
      )}

      <Dialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Consent (Admin)</DialogTitle>
            <DialogDescription>
              Revoke consent between {revokeTarget?.patientName} and {revokeTarget?.grantedToName}?
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              This will immediately revoke {revokeTarget?.grantedToName}&apos;s access to {revokeTarget?.patientName}&apos;s records.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeTarget && handleRevoke(revokeTarget)}>
              Revoke Consent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main page — delegates to role-specific view
// ---------------------------------------------------------------------------
function ConsentContent() {
  const { user } = useAuth()

  if (!user) return null

  const View =
    user.role === 'patient'
      ? PatientConsentView
      : user.role === 'doctor'
        ? DoctorConsentView
        : AdminConsentView

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6 space-y-6">
          <View />
        </div>
      </main>
    </div>
  )
}

export default function ConsentPage() {
  return (
    <ProtectedRoute>
      <ConsentContent />
    </ProtectedRoute>
  )
}
