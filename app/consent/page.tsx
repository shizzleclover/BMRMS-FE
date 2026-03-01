'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { SyncStatus } from '@/components/SyncStatus'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { getConsents, revokeConsent, createConsent, Consent, getConsentTypeLabel } from '@/lib/consent'
import { Plus, Eye, Trash2 } from 'lucide-react'

function ConsentContent() {
  const [consents, setConsents] = useState<Consent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [showNewConsent, setShowNewConsent] = useState(false)
  const [newConsentDoctorId, setNewConsentDoctorId] = useState('')
  const [newConsentAccess, setNewConsentAccess] = useState('read')
  const [isGranting, setIsGranting] = useState(false)

  const refreshConsents = async () => {
    setIsLoading(true)
    const allConsents = await getConsents()
    setConsents(allConsents)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshConsents()
  }, [])

  const handleGrantConsent = async () => {
    if (!newConsentDoctorId.trim()) return
    setIsGranting(true)
    const result = await createConsent({
      patientId: '',
      patientName: '',
      consentType: 'medical-records',
      grantedTo: newConsentDoctorId,
      status: 'active',
      grantedDate: new Date().toISOString(),
      purpose: newConsentAccess,
      scope: ['all_records'],
    })
    if (result) {
      await refreshConsents()
      setShowNewConsent(false)
      setNewConsentDoctorId('')
      setNewConsentAccess('read')
    }
    setIsGranting(false)
  }

  const handleRevoke = async (id: string) => {
    const updated = await revokeConsent(id, 'Revoked by patient')
    if (updated) {
      setConsents(consents.map(c => c.id === id ? updated : c))
      setRevokeId(null)
    }
  }

  const statusMap = {
    active: 'active' as const,
    revoked: 'revoked' as const,
    pending: 'pending' as const,
    expired: 'archived' as const,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 ml-12 p-6 space-y-6">
          <PageHeader
            title="Consent Management"
            description="Manage patient data access permissions and authorizations"
            icon="📋"
            action={
              <Dialog open={showNewConsent} onOpenChange={setShowNewConsent}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Consent
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Grant New Consent</DialogTitle>
                    <DialogDescription>
                      Grant a doctor access to your medical records.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="doctorId">Doctor User ID</Label>
                      <Input
                        id="doctorId"
                        value={newConsentDoctorId}
                        onChange={(e) => setNewConsentDoctorId(e.target.value)}
                        placeholder="Enter the doctor's user ID"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accessLevel">Access Level</Label>
                      <Select value={newConsentAccess} onValueChange={setNewConsentAccess}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read Only</SelectItem>
                          <SelectItem value="write">Read & Write</SelectItem>
                          <SelectItem value="full">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="ghost" onClick={() => setShowNewConsent(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGrantConsent} disabled={isGranting || !newConsentDoctorId.trim()}>
                        {isGranting ? 'Granting...' : 'Grant Consent'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            }
          />

          {/* Sync Status */}
          <div className="flex justify-end">
            <SyncStatus />
          </div>

          {/* Consents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-2 p-8 text-center text-muted-foreground">
                Loading consents...
              </div>
            ) : consents.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-muted-foreground">
                No consent records available.
              </div>
            ) : (
              consents.map((consent) => (
                <Card key={consent.id} className="border-border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{consent.patientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getConsentTypeLabel(consent.consentType)}
                        </p>
                      </div>
                      <StatusBadge status={statusMap[consent.status]} />
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Granted To:</span>
                        <span className="font-medium text-foreground">{consent.grantedTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Granted Date:</span>
                        <span className="text-foreground">{new Date(consent.grantedDate).toLocaleDateString()}</span>
                      </div>
                      {consent.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expiry Date:</span>
                          <span className="text-foreground">{new Date(consent.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Purpose */}
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Purpose:</p>
                      <p className="text-sm text-foreground">{consent.purpose}</p>
                    </div>

                    {/* Scope Tags */}
                    <div className="flex flex-wrap gap-1">
                      {consent.scope.map((scope) => (
                        <span key={scope} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {scope}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => setSelectedConsent(consent)}
                          >
                            <Eye className="w-4 h-4" />
                            Details
                          </Button>
                        </DialogTrigger>
                        {selectedConsent?.id === consent.id && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Consent Details</DialogTitle>
                              <DialogDescription>
                                {getConsentTypeLabel(selectedConsent.consentType)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Patient</p>
                                <p className="text-sm text-foreground">{selectedConsent.patientName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Granted To</p>
                                <p className="text-sm text-foreground">{selectedConsent.grantedTo}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Scope</p>
                                <div className="flex flex-wrap gap-1">
                                  {selectedConsent.scope.map((scope) => (
                                    <span key={scope} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                      {scope}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Audit Trail</p>
                                <div className="space-y-2">
                                  {selectedConsent.auditTrail.map((entry, idx) => (
                                    <div key={idx} className="text-xs border-l-2 border-border pl-2 py-1">
                                      <p className="font-medium text-foreground">{entry.action.toUpperCase()}</p>
                                      <p className="text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleString()} by {entry.actor}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>

                      {consent.status === 'active' && (
                        <Dialog open={revokeId === consent.id} onOpenChange={(open) => !open && setRevokeId(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 gap-1 text-destructive hover:text-destructive"
                              onClick={() => setRevokeId(consent.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Revoke
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Revoke Consent</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to revoke this consent?
                              </DialogDescription>
                            </DialogHeader>
                            <Alert variant="destructive">
                              <AlertDescription>
                                Once revoked, {consent.grantedTo} will no longer have access to the shared data.
                              </AlertDescription>
                            </Alert>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                onClick={() => setRevokeId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleRevoke(consent.id)}
                              >
                                Revoke Consent
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
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
